import 'package:flutter_test/flutter_test.dart';
import 'package:ototr_branch_app/data/repositories/report_template_repository.dart';
import 'package:ototr_branch_app/data/services/work_order_report_service.dart';
import 'package:ototr_branch_app/features/technician/report_entry/report_entry_screen.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('Kaporta katalog noktalari panel bolumlerine ayrilir', () async {
    final template = await AssetReportTemplateRepository().getActiveTemplate();
    final group = template.groups.firstWhere(isBodyPaintReportGroup);
    final sections = {
      for (final item in group.items) bodyPaintSectionForItem(item),
    };

    expect(sections, contains('Genel Kontroller'));
    expect(sections, contains('Ön Bölüm'));
    expect(sections, contains('Sol Yan'));
    expect(sections, contains('Sağ Yan'));
    expect(sections, contains('Arka Bölüm'));
    expect(sections, contains('Tavan ve Camlar'));
    expect(sections, contains('Şasi ve İç Yapı'));
  });

  test('Kaporta bolum sayaclari tum noktalari kapsar', () async {
    final template = await AssetReportTemplateRepository().getActiveTemplate();
    final group = template.groups.firstWhere(isBodyPaintReportGroup);
    final countsBySection = <String, int>{};
    for (final item in group.items) {
      final section = bodyPaintSectionForItem(item);
      countsBySection[section] = (countsBySection[section] ?? 0) + 1;
    }

    expect(group.items, hasLength(59));
    expect(
      countsBySection.values.fold<int>(0, (sum, count) => sum + count),
      group.items.length,
    );
    expect(countsBySection.values.every((count) => count > 0), isTrue);
  });

  test('Motor katalog noktalari teknik bolumlere ayrilir', () async {
    final template = await AssetReportTemplateRepository().getActiveTemplate();
    final group = template.groups.firstWhere(isMotorReportGroup);
    final sections = {
      for (final item in group.items) motorSectionForItem(item),
    };

    expect(sections, contains('Motor Genel'));
    expect(sections, contains('Sivi ve Bakim'));
    expect(sections, contains('Ses ve Calisma'));
    expect(sections, contains('Sogutma ve Klima'));
    expect(sections, contains('Sizdirmazlik ve Turbo'));
    expect(sections, contains('Egzoz ve Kompresyon'));
    expect(sections, contains('Servis Karari'));
  });

  test('Motor bolum sayaclari tum noktalari kapsar', () async {
    final template = await AssetReportTemplateRepository().getActiveTemplate();
    final group = template.groups.firstWhere(isMotorReportGroup);
    final countsBySection = <String, int>{};
    for (final item in group.items) {
      final section = motorSectionForItem(item);
      countsBySection[section] = (countsBySection[section] ?? 0) + 1;
    }

    expect(group.items, hasLength(37));
    expect(
      countsBySection.values.fold<int>(0, (sum, count) => sum + count),
      group.items.length,
    );
    expect(countsBySection.values.every((count) => count > 0), isTrue);
  });

  test('Mekanik katalog noktalari alt takim bolumlerine ayrilir', () async {
    final template = await AssetReportTemplateRepository().getActiveTemplate();
    final group = template.groups.firstWhere(isMechanicalReportGroup);
    final sections = {
      for (final item in group.items) mechanicalSectionForItem(item),
    };

    expect(sections, contains('Alt Govde ve Muhafaza'));
    expect(sections, contains('Yag ve Sizdirmazlik'));
    expect(sections, contains('On Takim ve Direksiyon'));
    expect(sections, contains('Fren Sistemi'));
    expect(sections, contains('Arka Takim ve Suspansiyon'));
    expect(sections, contains('Aktarma ve Diferansiyel'));
    expect(sections, contains('Egzoz ve Takozlar'));
  });

  test('Mekanik bolum sayaclari tum noktalari kapsar', () async {
    final template = await AssetReportTemplateRepository().getActiveTemplate();
    final group = template.groups.firstWhere(isMechanicalReportGroup);
    final countsBySection = <String, int>{};
    for (final item in group.items) {
      final section = mechanicalSectionForItem(item);
      countsBySection[section] = (countsBySection[section] ?? 0) + 1;
    }

    expect(group.items, hasLength(40));
    expect(
      countsBySection.values.fold<int>(0, (sum, count) => sum + count),
      group.items.length,
    );
    expect(countsBySection.values.every((count) => count > 0), isTrue);
  });

  test('OBD ve Airbag noktalari test bolumlerine ayrilir', () async {
    final template = await AssetReportTemplateRepository().getActiveTemplate();
    final obdGroup = template.groups.firstWhere(
      (group) => group.code == 'OBD_ECU_TEST',
    );
    final airbagGroup = template.groups.firstWhere(
      (group) => group.code == 'AIRBAG_CHECK',
    );

    final obdSections = {
      for (final item in obdGroup.items)
        focusedTestSectionForItem(obdGroup, item),
    };
    final airbagSections = {
      for (final item in airbagGroup.items)
        focusedTestSectionForItem(airbagGroup, item),
    };

    expect(obdSections, contains('Aktarma Elektronigi'));
    expect(obdSections, contains('Guvenlik ve Surus Elektronigi'));
    expect(obdSections, contains('OBD Ciktisi'));
    expect(airbagSections, contains('Airbag On Kosul'));
    expect(airbagSections, contains('Emniyet Kemeri'));
    expect(airbagSections, contains('Airbag Noktalari'));
  });

  test('Fren suspansiyon ve dyno yol testleri bolumlere ayrilir', () async {
    final template = await AssetReportTemplateRepository().getActiveTemplate();
    final brakeGroup = template.groups.firstWhere(
      (group) => group.code == 'BRAKE_SUSPENSION_TEST',
    );
    final dynoGroup = template.groups.firstWhere(
      (group) => group.code == 'DYNO_ROAD_TEST',
    );

    final brakeSections = {
      for (final item in brakeGroup.items)
        focusedTestSectionForItem(brakeGroup, item),
    };
    final dynoSections = {
      for (final item in dynoGroup.items)
        focusedTestSectionForItem(dynoGroup, item),
    };

    expect(brakeSections, contains('Fren Testi'));
    expect(brakeSections, contains('Suspansiyon Testi'));
    expect(brakeSections, contains('Test Ciktisi'));
    expect(dynoSections, contains('Dyno Olcumleri'));
    expect(dynoSections, contains('Yol Testi'));
    expect(dynoSections, contains('Dyno Ciktisi'));
  });
}
