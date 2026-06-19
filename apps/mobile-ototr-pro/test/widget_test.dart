import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ototr_mobile_pro/main.dart';

void main() {
  testWidgets('technician can move from login to final control flow', (tester) async {
    await tester.pumpWidget(const OtotrMobileProApp());

    expect(find.text('OTOTR Pro'), findsOneWidget);
    await tester.tap(find.byKey(const Key('login-submit')));
    await tester.pumpAndSettle();

    expect(find.text('Gunluk ozet'), findsOneWidget);
    await tester.tap(find.byKey(const Key('workorder-WO-2605-041')));
    await tester.pumpAndSettle();

    expect(find.text('Is emri detayi'), findsOneWidget);
    await tester.tap(find.byKey(const Key('module-Kaporta - Boya')));
    await tester.pumpAndSettle();

    expect(find.text('Kaporta - Boya'), findsWidgets);
    await tester.tap(find.byKey(const Key('item-Sol on camurluk')));
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('status-good')));
    await tester.enterText(find.byKey(const Key('micron-input')), '118');
    await tester.enterText(find.byKey(const Key('note-input')), 'Temiz panel');
    await tester.tap(find.byKey(const Key('save-item')));
    await tester.pumpAndSettle();

    expect(find.text('Sol on camurluk'), findsOneWidget);
    await tester.tap(find.byKey(const Key('module-evidence')));
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('evidence-Genel arac fotografi')));
    await tester.pumpAndSettle();
    expect(find.text('Yuklendi'), findsOneWidget);

    await tester.tap(find.byKey(const Key('save-evidence')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('module-final')));
    await tester.pumpAndSettle();

    expect(find.text('Final kontrol'), findsOneWidget);
    await tester.tap(find.byKey(const Key('send-approval')));
    await tester.pump();
    expect(find.textContaining('Eksikler'), findsWidgets);
  });

  testWidgets('all good shortcut fills unchecked module items', (tester) async {
    await tester.pumpWidget(const OtotrMobileProApp());
    await tester.tap(find.byKey(const Key('login-submit')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('workorder-WO-2605-041')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('module-Kaporta - Boya')));
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('all-good')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('confirm-all-good')));
    await tester.pumpAndSettle();

    expect(find.text('Orijinal / iyi'), findsWidgets);
  });
}
