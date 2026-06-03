# OTOTR Usta Mobil

Expo + React Native + TypeScript ile hazırlanmış OTOTR teknisyen mobil uygulaması.

## Kurulum

```powershell
npm install
```

## Çalıştırma

```powershell
npx expo start
```

## Android debug APK alma

Standart yol:

```powershell
npx expo prebuild --platform android
cd android
.\gradlew.bat assembleDebug
```

APK çıktısı:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Projede ayrıca kopyalanan APK dosyaları:

```text
dist/OTOTR-Usta-Live-Final.apk
dist/OTOTR-Usta-Demo.apk
```

## Windows yol uzunluğu notu

Windows'ta Android native build sırasında `Filename longer than 260 characters` hatası alınırsa proje kökü için kısa yol/junction kullanın. Bu makinede hazır kısa yol:

```powershell
cd C:\ototrapp\android
.\gradlew.bat assembleDebug
```

Asıl proje dizini değişmez:

```text
C:\Users\Samivolkannnn\Documents\ototr_25052026\ototr-usta-app
```

## Canlı Supabase ayarları

Mobil uygulama canlı Supabase bağlantısını `src/live/api.ts` içinden okur. Canlı akış için Expo public environment değerleri zorunludur; repoda varsayılan Supabase URL veya anahtar tutulmaz:

```powershell
$env:EXPO_PUBLIC_OTOTR_SUPABASE_URL="https://PROJECT_ID.supabase.co"
$env:EXPO_PUBLIC_OTOTR_SUPABASE_KEY="PUBLIC_ANON_OR_PUBLISHABLE_KEY"
npx expo start
```

Mobil uygulamaya kesinlikle `service_role` anahtarı koymayın. Mobilde sadece public anon/publishable key kullanılmalıdır; canlıya geçerken RLS politikaları sıkılaştırılmalıdır.

## Canlı uçtan uca test akışı

1. Bayi portalını açın: `https://samivolkan.github.io/Ototr/index.html?portal=dealer#dealer`
2. Sistemde eski demo kayıtlarını temizleyip tek bir yeni iş emri oluşturun.
3. Mobil APK'da teknisyen kullanıcısıyla giriş yapın.
4. Yeni iş emrinin `İşlerim` ekranına düştüğünü kontrol edin.
5. Araç bilgileri, kaporta kontrolü, kanıtlar ve final kontrol adımlarını tamamlayın.
6. Her girişten sonra mobil ve web tarafındaki tamamlanma yüzdesinin güncellendiğini kontrol edin.
7. Final adımında raporu teknik onaya gönderin ve web tarafında PDF/yazdırma ekranını kontrol edin.

Yerel test scriptleri için gerekiyorsa bu environment değerleri kullanılabilir:

```powershell
$env:OTOTR_SUPABASE_URL="https://PROJECT_ID.supabase.co"
$env:OTOTR_SUPABASE_ANON_KEY="PUBLIC_ANON_OR_PUBLISHABLE_KEY"
$env:OTOTR_SUPABASE_TEST_EMAIL="test-user@example.com"
$env:OTOTR_SUPABASE_TEST_PASSWORD="temporary-password"
```

Gerçek `.env` dosyalarını repoya eklemeyin.

## Release APK istenirse

Release APK için yapılacaklar:

1. Android keystore oluştur.
2. `android/app/build.gradle` içinde signing config tanımla.
3. Release build çalıştır:

```powershell
cd android
.\gradlew.bat assembleRelease
```

## Audit notu

`npm audit` Expo bağımlılık zincirinden gelen orta seviye uyarılar raporlayabilir. `npm audit fix --force` Expo sürümünü geriye çekebileceği veya proje uyumluluğunu bozabileceği için körlemesine çalıştırılmamalıdır.
