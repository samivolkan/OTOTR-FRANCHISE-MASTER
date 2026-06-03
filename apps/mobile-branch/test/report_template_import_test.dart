import 'package:flutter_test/flutter_test.dart';
import 'package:ototr_branch_app/data/models/report_template_model.dart';
import 'package:ototr_branch_app/data/services/report_template_asset_loader.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('JSON rapor sablonu asset uzerinden dinamik yuklenir', () async {
    const loader = ReportTemplateAssetLoader();

    final template = await loader.load();

    expect(template.sourceReportId, '2614045');
    expect(template.groups.length, 12);
    expect(template.totalItems, 265);
    expect(
      template.groups.any((group) => group.code == 'MOTOR_CHECKUP'),
      isTrue,
    );
  });

  test('Rapor maddeleri secenek ve input alanlarini tasir', () async {
    final template = await const ReportTemplateAssetLoader().load();
    final optionItem = template.allItems.firstWhere(
      (item) => item.options.isNotEmpty,
    );
    final inputItem = template.allItems.firstWhere(
      (item) => item.inputFields.isNotEmpty,
    );

    expect(optionItem.hasOptions, isTrue);
    expect(optionItem.options.first.scoreType, isA<ReportOptionScoreType>());
    expect(inputItem.hasInputs, isTrue);
    expect(inputItem.inputFields.first.id, isNotEmpty);
  });

  test('Kaporta katalog grubu panel ve mikron verisini tasir', () async {
    final template = await const ReportTemplateAssetLoader().load();
    final bodyPaintGroup = template.groups.firstWhere(
      (group) => group.code == 'BODY_PAINT_CHECKUP',
    );
    final micronItems = bodyPaintGroup.items.where(
      (item) => item.inputFields.any(
        (input) => input.label.toLowerCase().contains('mikron'),
      ),
    );

    expect(bodyPaintGroup.items, hasLength(59));
    expect(micronItems, isNotEmpty);
    expect(
      bodyPaintGroup.items.any(
        (item) => item.options.any((option) => option.label == 'Boyalı'),
      ),
      isTrue,
    );
  });
}
