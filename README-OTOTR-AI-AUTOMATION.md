# OTOTR AI Automation v1

Bu paket, ChatGPT/Codex/GitHub üçlüsünü denetimli proje yürütme sistemine çevirmek için başlangıç iskeletidir.

## Mantık

- ChatGPT: Ürün sahibi, analist ve kalite denetçisi gibi davranır.
- GitHub Issues: Her işi küçük, ölçülebilir görev haline getirir.
- Codex: Issue bazlı kod değişikliği yapar, branch/PR üretir.
- GitHub Actions: Codex'i otomatik çalıştırır ve sonucu PR/comment olarak bırakır.
- İnsan onayı: Merge, production deploy ve kritik kararlar otomatik yapılmaz.

## Kurulum

1. Bu dosyalar `OTOTR-FRANCHISE-MASTER` repo köküne eklenmiştir.
2. GitHub repo ayarlarında `OPENAI_API_KEY` secret ekleyin.
3. GitHub Actions permissions için `Read and write permissions` açın.
4. İlk test için bir Issue açın ve içine `/codex-run` yazın.
5. Alternatif: Actions sekmesinden `OTOTR Codex Issue Runner` workflow'unu manuel başlatın.

## Yerel planlayıcı

`docs/AI_INBOX.md` içine ChatGPT sohbetinden çıkan kararları koyun.

```bash
npm install
OPENAI_API_KEY=... GITHUB_REPO=samivolkan/OTOTR-FRANCHISE-MASTER npm run ai:plan:dry
OPENAI_API_KEY=... GITHUB_REPO=samivolkan/OTOTR-FRANCHISE-MASTER npm run ai:plan
```

Bu script `AI_INBOX` içeriğini GitHub Issue taslaklarına böler. `--dry-run` ile önce terminalde kontrol edebilirsiniz.

## Güvenlik

- `OPENAI_API_KEY` veya GitHub token'ı dosyaya yazmayın.
- Codex'in açtığı PR'lar incelenmeden merge edilmemelidir.
- Üretim veritabanı migration, ödeme, kullanıcı verisi ve yetki sistemi gibi işler ayrı review ister.
