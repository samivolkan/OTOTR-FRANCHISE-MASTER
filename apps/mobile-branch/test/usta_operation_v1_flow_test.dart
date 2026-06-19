import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ototr_branch_app/features/mobile_workflow/usta_operation_v1_screen.dart';

void main() {
  testWidgets('usta operasyon v1 tum temel dokunma ve giris akisini tamamlar',
      (tester) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(
      const MaterialApp(home: UstaOperationV1Screen()),
    );

    expect(find.text('1 araç otoraporlanmayı bekliyor'), findsOneWidget);
    expect(find.text('16SVK16'), findsOneWidget);

    await tester.ensureVisible(find.text('Araç resimleri çekilmedi'));
    await tester.tap(find.text('Araç resimleri çekilmedi'));
    await tester.pump();
    expect(find.text('Araç resimleri çekildi'), findsOneWidget);

    await tester.ensureVisible(find.text('16SVK16').first);
    await tester.tap(find.text('16SVK16').first);
    await tester.pumpAndSettle();
    expect(find.text('İş Emri Detayı'), findsWidgets);
    expect(find.text('Göreve Başla'), findsOneWidget);

    await tester.ensureVisible(find.text('Göreve Başla'));
    await tester.tap(find.text('Göreve Başla'));
    await tester.pumpAndSettle();
    expect(find.text('Ekspertiz Modülleri'), findsWidgets);
    expect(find.text('Kaporta - Boya Ekspertiz ve Check-Up'), findsOneWidget);

    await tester.ensureVisible(find.text('Testi Başlat').first);
    await tester.tap(find.text('Testi Başlat').first);
    await tester.pumpAndSettle();
    expect(find.text('Test Girişi'), findsWidgets);
    expect(find.text('Km değerini girin'), findsOneWidget);

    await tester.enterText(find.widgetWithText(TextField, 'Km değerini girin'), '68450');
    await tester.enterText(
      find.widgetWithText(TextField, 'Şase numarasını girin'),
      'WVWZZZ3CZEP005235',
    );
    await tester.ensureVisible(find.widgetWithText(TextField, 'Mikron değeri'));
    await tester.enterText(find.widgetWithText(TextField, 'Mikron değeri'), '210');
    await tester.enterText(
      find.widgetWithText(TextField, 'Not'),
      'Sol ön çamurlukta lokal boya ölçümü var.',
    );
    await tester.tap(find.text('Boyalı'));
    await tester.pump();
    await tester.tap(find.text('Tüm Noktalar İyi Durumda'));
    await tester.pump();
    expect(find.text('Tüm Noktalar İyi Durumda İşaretlendi'), findsOneWidget);

    await tester.ensureVisible(find.text('Kaydet ve Kanıtlara Geç'));
    await tester.tap(find.text('Kaydet ve Kanıtlara Geç'));
    await tester.pumpAndSettle();
    expect(find.text('Fotoğraf & Kanıt'), findsWidgets);

    const evidenceKeys = [
      'evidence-capture-Ön Panel',
      'evidence-capture-Arka Panel',
      'evidence-capture-Şase Etiketi',
      'evidence-capture-Hasarlı Bölge Fotoğrafı',
    ];
    for (final evidenceKey in evidenceKeys) {
      final captureButton = find.byKey(ValueKey(evidenceKey));
      await tester.ensureVisible(captureButton);
      await tester.tap(captureButton);
      await tester.pump();
    }
    expect(find.text('Çekildi'), findsNWidgets(4));

    await tester.ensureVisible(find.text('Çekilenleri Gönder'));
    await tester.tap(find.text('Çekilenleri Gönder'));
    await tester.pumpAndSettle();
    expect(find.text('Final Kontrol'), findsWidgets);
    expect(find.text('Tüm zorunlu alanlar tamamlandı'), findsOneWidget);

    await tester.tap(find.text('Raporu Teknik Onaya Gönder'));
    await tester.pump();
    expect(find.text('Rapor teknik onaya gönderildi'), findsOneWidget);

    await tester.tap(find.text('İş Emirlerine Dön'));
    await tester.pumpAndSettle();
    expect(find.text('1 araç otoraporlanmayı bekliyor'), findsOneWidget);
  });
}
