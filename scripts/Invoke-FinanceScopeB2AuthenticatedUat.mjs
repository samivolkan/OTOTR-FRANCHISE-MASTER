import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createScopeB2AuthenticatedUat} from '../packages/shared/src/finance-scope-b2-authenticated-uat.mjs';

const required=name=>{const value=process.env[name]?.trim();if(!value)throw new Error(`${name} is required`);return value;};
const output=process.argv[2];
if(!output)throw new Error('Usage: node scripts/Invoke-FinanceScopeB2AuthenticatedUat.mjs <evidence.json>');
const target=resolve(output);
const root=resolve(import.meta.dirname,'..');
if(!target.startsWith(root+'\\')&&!target.startsWith(root+'/'))throw new Error('Evidence output must stay inside the repository');

const run=createScopeB2AuthenticatedUat();
const evidence=await run({
  financeAccessToken:required('OTOTR_FINANCE_UAT_FINANCE_ACCESS_TOKEN'),
  branchManagerAccessToken:required('OTOTR_FINANCE_UAT_BRANCH_MANAGER_ACCESS_TOKEN'),
  publishableKey:required('OTOTR_FINANCE_UAT_PUBLISHABLE_KEY'),
  initiator:process.env.OTOTR_FINANCE_UAT_INITIATOR?.trim()||'BRANCH_MANAGER'
});
await writeFile(target,JSON.stringify(evidence,null,2)+'\n',{encoding:'utf8',flag:'wx'});
console.log(JSON.stringify({status:'PASSED',target:evidence.target,operations:evidence.operations.length,netGrossAmount:evidence.royaltyBalance.finance.netGrossAmount,crossScopeStatus:evidence.scopeMatrix.branchManagerCrossScopeStatus,tokensRecorded:false}));
