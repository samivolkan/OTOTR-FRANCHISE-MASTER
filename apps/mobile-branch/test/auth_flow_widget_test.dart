import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ototr_branch_app/core/navigation/app_router.dart';
import 'package:ototr_branch_app/features/auth/branch_selection_screen.dart';
import 'package:ototr_branch_app/features/auth/login_screen.dart';
import 'package:ototr_branch_app/features/auth/password_reset_screen.dart';
import 'package:ototr_branch_app/features/mobile_workflow/usta_operation_v1_screen.dart';

void main() {
  testWidgets('giris sube secimi uzerinden ana operasyon akisini acar',
      (tester) async {
    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(
      const MaterialApp(
        home: LoginScreen(),
        onGenerateRoute: AppRouter.onGenerateRoute,
      ),
    );

    expect(find.byType(LoginScreen), findsOneWidget);
    expect(find.textContaining('Google'), findsNothing);
    expect(find.textContaining('Apple'), findsNothing);

    await tester.enterText(
      find.widgetWithText(TextFormField, 'Telefon / E-posta'),
      'ahmet.usta@ototr.test',
    );
    await tester.enterText(
      find.widgetWithText(TextFormField, 'Sifre').evaluate().isNotEmpty
          ? find.widgetWithText(TextFormField, 'Sifre')
          : find.byType(TextFormField).at(1),
      'Demo1234',
    );
    await tester.ensureVisible(find.byKey(const ValueKey('auth-login-submit')));
    await tester.tap(find.byKey(const ValueKey('auth-login-submit')));
    await tester.pumpAndSettle();

    expect(find.byType(BranchSelectionScreen), findsOneWidget);

    await tester.ensureVisible(
      find.byKey(const ValueKey('auth-branch-continue')),
    );
    await tester.tap(find.byKey(const ValueKey('auth-branch-continue')));
    await tester.pumpAndSettle();

    expect(find.byType(UstaOperationV1Screen), findsOneWidget);
    expect(find.text('16SVK16'), findsWidgets);
  });

  testWidgets('sifre sifirlama akisi kod ve yeni sifre ekranlarini acar',
      (tester) async {
    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(
      const MaterialApp(
        home: LoginScreen(),
        onGenerateRoute: AppRouter.onGenerateRoute,
      ),
    );

    await tester.ensureVisible(find.textContaining('Unuttum'));
    await tester.tap(find.textContaining('Unuttum'));
    await tester.pumpAndSettle();

    expect(find.byType(PasswordResetScreen), findsOneWidget);
    await tester.enterText(
      find.widgetWithText(TextFormField, 'Personel telefonu'),
      '05551234567',
    );
    await tester.ensureVisible(find.byKey(const ValueKey('auth-reset-send')));
    await tester.tap(find.byKey(const ValueKey('auth-reset-send')));
    await tester.pumpAndSettle();

    expect(find.byType(OtpVerificationScreen), findsOneWidget);
    final otpFields = find.byType(TextField);
    for (var index = 0; index < 6; index++) {
      await tester.enterText(otpFields.at(index), '${index + 1}');
    }
    await tester.ensureVisible(find.byKey(const ValueKey('auth-otp-verify')));
    await tester.tap(find.byKey(const ValueKey('auth-otp-verify')));
    await tester.pumpAndSettle();

    expect(find.byType(NewPasswordScreen), findsOneWidget);
    await tester.enterText(
      find.widgetWithText(TextFormField, 'Yeni Sifre'),
      'Yeni1234',
    );
    await tester.enterText(
      find.widgetWithText(TextFormField, 'Yeni Sifre Tekrar'),
      'Yeni1234',
    );
    await tester.ensureVisible(
      find.byKey(const ValueKey('auth-new-password-submit')),
    );
    await tester.tap(find.byKey(const ValueKey('auth-new-password-submit')));
    await tester.pumpAndSettle();

    expect(find.byType(LoginScreen), findsOneWidget);
  });
}
