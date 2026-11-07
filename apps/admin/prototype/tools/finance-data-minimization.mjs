const FORBIDDEN_KEY=/^(payload|rawPayload|rawContext|safeContext|objectKey|storageKey|email|phone|customerName|customerEmail|customerPhone|taxNumber|tckn|vkn|cardNumber|card_number|pan|cvv|cvc|accessToken|access_token|refreshToken|refresh_token|password|serviceRoleKey|service_role)$/i;
const RAW_EXPOSURE=/^raw[A-Z0-9_].*Exposed$/;
const SECRET_VALUE=/(sb_secret_[a-z0-9_-]+|bearer\s+[a-z0-9._-]{20,}|eyJ[a-z0-9_-]{20,}\.[a-z0-9_-]{10,}\.[a-z0-9_-]{10,})/i;

export function assertFinanceDataMinimized(value,label='finance response'){
  const seen=new Set();
  const visit=(item,path)=>{
    if(typeof item==='string'){
      if(SECRET_VALUE.test(item))throw new Error(`${label} contains a secret-like value at ${path}`);
      return;
    }
    if(item===null||typeof item!=='object')return;
    if(seen.has(item))throw new Error(`${label} contains a cyclic object at ${path}`);
    seen.add(item);
    if(Array.isArray(item)){item.forEach((entry,index)=>visit(entry,`${path}[${index}]`));seen.delete(item);return;}
    for(const [key,entry] of Object.entries(item)){
      const child=`${path}.${key}`;
      if(FORBIDDEN_KEY.test(key))throw new Error(`${label} exposes forbidden field ${child}`);
      if(RAW_EXPOSURE.test(key)&&entry!==false)throw new Error(`${label} has unsafe exposure marker ${child}`);
      visit(entry,child);
    }
    seen.delete(item);
  };
  visit(value,'$');
  return true;
}
