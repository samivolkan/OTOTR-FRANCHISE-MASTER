import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source = await readFile(new URL('../gm-ik/index.html', import.meta.url), 'utf8');
const block = source.match(/const D=\[([\s\S]*?)\];\s*let dsel=/)?.[1];
assert.ok(block, 'GM HR organization source must remain discoverable');

const actual = [...block.matchAll(/\{id:"([^"]+)",ad:"([^"]+)",ust:(null|"[^"]+"),tur:"([^"]+)",pos:\[Q\("([^"]+)",(\d+),(\d+),"([^"]+)","([^"]+)"\)\]\}/g)]
  .map((match) => ({
    id: match[1], name: match[2], parent: match[3] === 'null' ? null : match[3].slice(1, -1),
    type: match[4], title: match[5], headcount: Number(match[6]), occupied: Number(match[7]),
    responsibility: match[8], scope: match[9],
  }));

const expected = [
  ['yk','Yönetim Kurulu',null,'Merkez','Yönetim Kurulu Başkanı','Tüm kuruluş'],
  ['ceo','CEO Ofisi','yk','Merkez','CEO / Genel Müdür','Tüm kuruluş'],
  ['muh','Muhasebe ve Finans','ceo','Merkez','Yeminli Müşavir','Tüm kuruluş'],
  ['bt','Bilgi Teknolojileri','ceo','Merkez','Bilgi Teknolojileri Sorumlusu','Tüm kuruluş'],
  ['huk','Hukuk ve Uyum','ceo','Merkez','Sorumlu Avukat','Tüm kuruluş'],
  ['fyb','Franchise ve Şube Geliştirme','ceo','Merkez','Franchise ve Şube Geliştirme Sorumlusu','Tüm kuruluş'],
  ['pzr','Marka ve Pazarlama','ceo','Merkez','Marka ve Pazarlama Sorumlusu','Tüm kuruluş'],
  ['smd','Sosyal Medya ve İçerik','pzr','Merkez','Sosyal Medya ve İçerik Sorumlusu','Departman'],
  ['saha','Saha Satış','fyb','Merkez','Saha Satış Sorumlusu','Tüm kuruluş'],
  ['ik','İK Operasyon Merkezi','ceo','Merkez','İK Operasyon Sorumlusu','Tüm kuruluş'],
  ['tek','Teknik Kalite ve Akademi','ceo','Merkez','Teknik Kalite ve Akademi Sorumlusu','Tüm kuruluş'],
  ['aka','Akademi','tek','Merkez','Akademi Sorumlusu','Departman'],
  ['sube','Şube Ağı (Franchise)','fyb','Franchise','Şube Ağı Sorumlusu','Şirket'],
].map(([id,name,parent,type,title,scope]) => ({id,name,parent,type,title,headcount:1,occupied:1,responsibility:'Merkez sorumlusu',scope}));
expected[0].responsibility = 'Üst yönetim';
expected[1].responsibility = 'Üst yönetim';

assert.deepEqual(actual, expected, 'GM HR organization tree, single-owner positions or hierarchy changed');
assert.equal(actual.filter((unit) => unit.id.startsWith('branch-')).length, 0, 'Branch organization must not enter the central tree');
console.log(JSON.stringify({result:'PASS', units:actual.length, centralSingleOwnerPositions:actual.length, branchNodes:0}));
