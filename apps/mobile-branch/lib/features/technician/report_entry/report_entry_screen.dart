import 'dart:async';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/constants/app_sizes.dart';
import '../../../core/navigation/app_routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/ototr_app_bar.dart';
import '../../../core/widgets/ototr_card.dart';
import '../../../core/widgets/ototr_empty_state.dart';
import '../../../core/widgets/ototr_primary_button.dart';
import '../../../core/widgets/ototr_secondary_button.dart';
import '../../../data/models/report_template_model.dart';
import '../../../data/models/technician_operation_model.dart';
import '../../../data/models/user_profile_model.dart';
import '../../../data/repositories/app_repositories.dart';
import '../../../data/repositories/report_template_repository.dart';
import '../../../data/repositories/work_order_report_repository.dart';
import '../../../data/services/photo_upload_service.dart';
import '../../../data/services/work_order_report_service.dart';
import '../widgets/technician_vehicle_header.dart';

enum _BodyPaintFilter { all, missing, completed, measurement, evidence }

enum _MotorFilter { all, missing, completed, measurement, risk }

enum _MechanicalFilter { all, missing, completed, evidence, risk }

enum _FocusedTestFilter { all, missing, completed, measurement, evidence, risk }

class ReportEntryScreen extends StatefulWidget {
  const ReportEntryScreen({super.key, required this.workOrderId});

  final String workOrderId;

  @override
  State<ReportEntryScreen> createState() => _ReportEntryScreenState();
}

class _ReportEntryScreenState extends State<ReportEntryScreen> {
  Future<_ReportEntryData>? _future;
  String? _selectedGroupId;
  final TextEditingController _bodyPaintMicronController =
      TextEditingController();
  final TextEditingController _motorAntifreezeController =
      TextEditingController();
  final TextEditingController _motorBatteryController = TextEditingController();
  _BodyPaintFilter _bodyPaintFilter = _BodyPaintFilter.all;
  _MotorFilter _motorFilter = _MotorFilter.all;
  _MechanicalFilter _mechanicalFilter = _MechanicalFilter.all;
  _FocusedTestFilter _focusedTestFilter = _FocusedTestFilter.all;
  bool _isSubmittingGroup = false;

  WorkOrderReportService get _service => WorkOrderReportService(
        templateRepository: _templateRepository,
        reportRepository: _reportRepository,
      );

  ReportTemplateRepository get _templateRepository =>
      AppRepositories.instance.reportTemplates;

  WorkOrderReportRepository get _reportRepository =>
      AppRepositories.instance.workOrderReports;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  @override
  void dispose() {
    _bodyPaintMicronController.dispose();
    _motorAntifreezeController.dispose();
    _motorBatteryController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<_ReportEntryData>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          return Scaffold(
            appBar: const OtotrAppBar(title: 'Rapor Girişi'),
            backgroundColor: AppColors.grayBg,
            body: Padding(
              padding: const EdgeInsets.all(AppSizes.lg),
              child: OtotrCard(
                child: Text(
                  'Rapor şablonu alınamadı: ${snapshot.error}',
                  style: const TextStyle(color: AppColors.red),
                ),
              ),
            ),
          );
        }

        if (!snapshot.hasData) {
          return const Scaffold(
            appBar: OtotrAppBar(title: 'Rapor Girişi'),
            backgroundColor: AppColors.grayBg,
            body: Center(child: CircularProgressIndicator()),
          );
        }

        final data = snapshot.data!;
        final selectedGroup =
            _selectedGroupId == null ? null : _selectedVisibleGroup(data);

        return Scaffold(
          appBar: OtotrAppBar(
            title: selectedGroup == null ? 'Rapor Girişi' : selectedGroup.title,
          ),
          backgroundColor: AppColors.grayBg,
          body: selectedGroup == null
              ? _buildGroups(data)
              : _buildGroupDetail(data, selectedGroup),
        );
      },
    );
  }

  Widget _buildGroups(_ReportEntryData data) {
    return ListView(
      padding: const EdgeInsets.all(AppSizes.lg),
      children: [
        TechnicianVehicleHeader(order: data.order),
        _OverallProgressCard(percent: data.overallPercent),
        for (final group in data.visibleGroups)
          _GroupProgressCard(
            group: group,
            progress: data.progress[group.id],
            onTap: () => setState(() => _selectedGroupId = group.id),
          ),
        OtotrSecondaryButton(
          label: 'Rapor Medyalarına Git',
          icon: Icons.photo_camera,
          onPressed: () => Navigator.pushNamed(
            context,
            AppRoutes.technicianEvidence,
            arguments: widget.workOrderId,
          ).then((_) => _refresh()),
        ),
        const SizedBox(height: 8),
        OtotrPrimaryButton(
          label: 'Final Raporu Hazırla',
          icon: Icons.article,
          onPressed: () => Navigator.pushNamed(
            context,
            AppRoutes.finalReportPreview,
            arguments: widget.workOrderId,
          ).then((_) => _refresh()),
        ),
      ],
    );
  }

  Widget _buildGroupDetail(
    _ReportEntryData data,
    ReportTemplateGroup group,
  ) {
    final answersByItem = {
      for (final answer in data.answers) answer.itemId: answer,
    };
    final progress = data.progress[group.id];
    final total = progress?.totalItems ?? group.items.length;
    final completed = progress?.completedItems ??
        group.items
            .where((item) => answersByItem[item.id]?.isCompleted == true)
            .length;
    final isGroupComplete = total > 0 && completed >= total;
    final isBodyPaintGroup = isBodyPaintReportGroup(group);
    final isMotorGroup = isMotorReportGroup(group);
    final isMechanicalGroup = isMechanicalReportGroup(group);
    final isFocusedTestGroup =
        isDiagnosticReportGroup(group) || isRoadTestReportGroup(group);

    return ListView(
      padding: const EdgeInsets.all(AppSizes.lg),
      children: [
        OtotrSecondaryButton(
          label: 'Gruplara Dön',
          icon: Icons.arrow_back,
          onPressed: () => setState(() => _selectedGroupId = null),
        ),
        _GroupProgressCard(
          group: group,
          progress: progress,
          onTap: () {},
        ),
        if (isBodyPaintGroup && reportGroupHasMicronInputs(group))
          _BodyPaintQuickInputCard(
            group: group,
            controller: _bodyPaintMicronController,
          ),
        if (isMotorGroup)
          _MotorQuickInputCard(
            group: group,
            antifreezeController: _motorAntifreezeController,
            batteryController: _motorBatteryController,
          ),
        if (isMechanicalGroup) _MechanicalQuickInfoCard(group: group),
        if (isFocusedTestGroup) _FocusedTestQuickInfoCard(group: group),
        if (isBodyPaintGroup)
          _BodyPaintFilterCard(
            selected: _bodyPaintFilter,
            counts: _bodyPaintFilterCounts(group, answersByItem),
            onChanged: (filter) => setState(() => _bodyPaintFilter = filter),
          ),
        if (isMotorGroup)
          _MotorFilterCard(
            selected: _motorFilter,
            counts: _motorFilterCounts(group, answersByItem),
            onChanged: (filter) => setState(() => _motorFilter = filter),
          ),
        if (isMechanicalGroup)
          _MechanicalFilterCard(
            selected: _mechanicalFilter,
            counts: _mechanicalFilterCounts(group, answersByItem),
            onChanged: (filter) => setState(() => _mechanicalFilter = filter),
          ),
        if (isFocusedTestGroup)
          _FocusedTestFilterCard(
            selected: _focusedTestFilter,
            counts: _focusedTestFilterCounts(group, answersByItem),
            onChanged: (filter) => setState(() => _focusedTestFilter = filter),
          ),
        ..._buildReportItemCards(data, group, answersByItem),
        OtotrCard(
          child: SizedBox(
            width: double.infinity,
            height: AppSizes.buttonHeight,
            child: FilledButton.icon(
              onPressed: () => _markGroupAllGood(data, group),
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.white,
                foregroundColor: AppColors.success,
                side: const BorderSide(color: AppColors.grayBorder),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppSizes.radius),
                ),
              ),
              icon: const Icon(Icons.done_all),
              label: const Text(
                'Tüm Noktalar İyi Durumda',
                style: TextStyle(fontWeight: FontWeight.w900),
              ),
            ),
          ),
        ),
        _SubmitGroupCard(
          completed: completed,
          total: total,
          isComplete: isGroupComplete,
          onSubmit: _isSubmittingGroup ? null : () => _submitGroup(data, group),
        ),
      ],
    );
  }

  List<Widget> _buildReportItemCards(
    _ReportEntryData data,
    ReportTemplateGroup group,
    Map<String, WorkOrderReportAnswer> answersByItem,
  ) {
    final isBodyPaintGroup = isBodyPaintReportGroup(group);
    final isMotorGroup = isMotorReportGroup(group);
    final isMechanicalGroup = isMechanicalReportGroup(group);
    final isFocusedTestGroup =
        isDiagnosticReportGroup(group) || isRoadTestReportGroup(group);
    if (!isBodyPaintGroup &&
        !isMotorGroup &&
        !isMechanicalGroup &&
        !isFocusedTestGroup) {
      return [
        for (final item in group.items)
          _ReportItemCard(
            item: item,
            answer: answersByItem[item.id],
            onTap: () => _openItemForm(data, group, item),
          ),
      ];
    }

    if (isMotorGroup) {
      final visibleItems = [
        for (final item in group.items)
          if (_motorFilterAllows(item, answersByItem[item.id])) item,
      ];
      if (visibleItems.isEmpty) {
        return [
          const OtotrEmptyState(
            title: 'Bu filtrede motor noktasi yok',
            message: 'Motor filtrelerini degistirerek diger noktalari gorun.',
            icon: Icons.filter_alt_off,
          ),
          OtotrSecondaryButton(
            label: 'Tumunu Goster',
            icon: Icons.filter_alt_off,
            onPressed: () => setState(
              () => _motorFilter = _MotorFilter.all,
            ),
          ),
        ];
      }

      final widgets = <Widget>[];
      String? currentSection;
      for (final item in visibleItems) {
        final section = motorSectionForItem(item);
        if (section != currentSection) {
          currentSection = section;
          final sectionItems = visibleItems
              .where((item) => motorSectionForItem(item) == section)
              .toList(growable: false);
          final completedItems = sectionItems
              .where((item) => answersByItem[item.id]?.isCompleted == true)
              .length;
          widgets.add(
            _ReportSectionHeader(
              title: section,
              completed: completedItems,
              total: sectionItems.length,
              color: AppColors.info,
            ),
          );
        }
        widgets.add(
          _ReportItemCard(
            item: item,
            answer: answersByItem[item.id],
            onTap: () => _openItemForm(data, group, item),
            quickOptions: _motorQuickOptions(item),
            onQuickOptionSelected: (option) => _saveQuickOption(
              data: data,
              group: group,
              item: item,
              option: option,
            ),
          ),
        );
      }
      return widgets;
    }

    if (isMechanicalGroup) {
      final visibleItems = [
        for (final item in group.items)
          if (_mechanicalFilterAllows(item, answersByItem[item.id])) item,
      ];
      if (visibleItems.isEmpty) {
        return [
          const OtotrEmptyState(
            title: 'Bu filtrede mekanik noktasi yok',
            message: 'Mekanik filtrelerini degistirerek diger noktalari gorun.',
            icon: Icons.filter_alt_off,
          ),
          OtotrSecondaryButton(
            label: 'Tumunu Goster',
            icon: Icons.filter_alt_off,
            onPressed: () => setState(
              () => _mechanicalFilter = _MechanicalFilter.all,
            ),
          ),
        ];
      }

      final widgets = <Widget>[];
      String? currentSection;
      for (final item in visibleItems) {
        final section = mechanicalSectionForItem(item);
        if (section != currentSection) {
          currentSection = section;
          final sectionItems = visibleItems
              .where((item) => mechanicalSectionForItem(item) == section)
              .toList(growable: false);
          final completedItems = sectionItems
              .where((item) => answersByItem[item.id]?.isCompleted == true)
              .length;
          widgets.add(
            _ReportSectionHeader(
              title: section,
              completed: completedItems,
              total: sectionItems.length,
              color: AppColors.warning,
            ),
          );
        }
        widgets.add(
          _ReportItemCard(
            item: item,
            answer: answersByItem[item.id],
            onTap: () => _openItemForm(data, group, item),
            quickOptions: _technicalQuickOptions(item),
            onQuickOptionSelected: (option) => _saveQuickOption(
              data: data,
              group: group,
              item: item,
              option: option,
            ),
          ),
        );
      }
      return widgets;
    }

    if (isFocusedTestGroup) {
      final visibleItems = [
        for (final item in group.items)
          if (_focusedTestFilterAllows(item, answersByItem[item.id])) item,
      ];
      if (visibleItems.isEmpty) {
        return [
          const OtotrEmptyState(
            title: 'Bu filtrede test noktasi yok',
            message: 'Test filtrelerini degistirerek diger noktalari gorun.',
            icon: Icons.filter_alt_off,
          ),
          OtotrSecondaryButton(
            label: 'Tumunu Goster',
            icon: Icons.filter_alt_off,
            onPressed: () => setState(
              () => _focusedTestFilter = _FocusedTestFilter.all,
            ),
          ),
        ];
      }

      final widgets = <Widget>[];
      String? currentSection;
      for (final item in visibleItems) {
        final section = focusedTestSectionForItem(group, item);
        if (section != currentSection) {
          currentSection = section;
          final sectionItems = visibleItems
              .where(
                  (item) => focusedTestSectionForItem(group, item) == section)
              .toList(growable: false);
          final completedItems = sectionItems
              .where((item) => answersByItem[item.id]?.isCompleted == true)
              .length;
          widgets.add(
            _ReportSectionHeader(
              title: section,
              completed: completedItems,
              total: sectionItems.length,
              color: AppColors.info,
            ),
          );
        }
        widgets.add(
          _ReportItemCard(
            item: item,
            answer: answersByItem[item.id],
            onTap: () => _openItemForm(data, group, item),
            quickOptions: _technicalQuickOptions(item),
            onQuickOptionSelected: (option) => _saveQuickOption(
              data: data,
              group: group,
              item: item,
              option: option,
            ),
          ),
        );
      }
      return widgets;
    }

    final visibleItems = [
      for (final item in group.items)
        if (_bodyPaintFilterAllows(item, answersByItem[item.id])) item,
    ];
    final widgets = <Widget>[];
    if (visibleItems.isEmpty) {
      return [
        const OtotrEmptyState(
          title: 'Bu filtrede nokta yok',
          message: 'Kaporta filtrelerini değiştirerek diğer noktaları görün.',
          icon: Icons.filter_alt_off,
        ),
        OtotrSecondaryButton(
          label: 'Tümünü Göster',
          icon: Icons.filter_alt_off,
          onPressed: () => setState(
            () => _bodyPaintFilter = _BodyPaintFilter.all,
          ),
        ),
      ];
    }
    String? currentSection;
    for (final item in visibleItems) {
      final section = bodyPaintSectionForItem(item);
      if (section != currentSection) {
        currentSection = section;
        final sectionItems = visibleItems
            .where((item) => bodyPaintSectionForItem(item) == section)
            .toList(growable: false);
        final completedItems = sectionItems
            .where((item) => answersByItem[item.id]?.isCompleted == true)
            .length;
        widgets.add(
          _ReportSectionHeader(
            title: section,
            completed: completedItems,
            total: sectionItems.length,
            color: AppColors.red,
          ),
        );
      }
      widgets.add(
        _ReportItemCard(
          item: item,
          answer: answersByItem[item.id],
          onTap: () => _openItemForm(data, group, item),
          quickOptions: _bodyPaintQuickOptions(item),
          onQuickOptionSelected: (option) => _saveQuickOption(
            data: data,
            group: group,
            item: item,
            option: option,
          ),
        ),
      );
    }
    return widgets;
  }

  Map<_BodyPaintFilter, int> _bodyPaintFilterCounts(
    ReportTemplateGroup group,
    Map<String, WorkOrderReportAnswer> answersByItem,
  ) {
    return {
      for (final filter in _BodyPaintFilter.values)
        filter: group.items
            .where((item) => _bodyPaintFilterAllowsWith(
                  filter,
                  item,
                  answersByItem[item.id],
                ))
            .length,
    };
  }

  Map<_MotorFilter, int> _motorFilterCounts(
    ReportTemplateGroup group,
    Map<String, WorkOrderReportAnswer> answersByItem,
  ) {
    return {
      for (final filter in _MotorFilter.values)
        filter: group.items
            .where((item) => _motorFilterAllowsWith(
                  filter,
                  item,
                  answersByItem[item.id],
                ))
            .length,
    };
  }

  Map<_MechanicalFilter, int> _mechanicalFilterCounts(
    ReportTemplateGroup group,
    Map<String, WorkOrderReportAnswer> answersByItem,
  ) {
    return {
      for (final filter in _MechanicalFilter.values)
        filter: group.items
            .where((item) => _mechanicalFilterAllowsWith(
                  filter,
                  item,
                  answersByItem[item.id],
                ))
            .length,
    };
  }

  Map<_FocusedTestFilter, int> _focusedTestFilterCounts(
    ReportTemplateGroup group,
    Map<String, WorkOrderReportAnswer> answersByItem,
  ) {
    return {
      for (final filter in _FocusedTestFilter.values)
        filter: group.items
            .where((item) => _focusedTestFilterAllowsWith(
                  filter,
                  item,
                  answersByItem[item.id],
                ))
            .length,
    };
  }

  bool _bodyPaintFilterAllows(
    ReportTemplateItem item,
    WorkOrderReportAnswer? answer,
  ) {
    return _bodyPaintFilterAllowsWith(_bodyPaintFilter, item, answer);
  }

  bool _motorFilterAllows(
    ReportTemplateItem item,
    WorkOrderReportAnswer? answer,
  ) {
    return _motorFilterAllowsWith(_motorFilter, item, answer);
  }

  bool _mechanicalFilterAllows(
    ReportTemplateItem item,
    WorkOrderReportAnswer? answer,
  ) {
    return _mechanicalFilterAllowsWith(_mechanicalFilter, item, answer);
  }

  bool _focusedTestFilterAllows(
    ReportTemplateItem item,
    WorkOrderReportAnswer? answer,
  ) {
    return _focusedTestFilterAllowsWith(_focusedTestFilter, item, answer);
  }

  bool _bodyPaintFilterAllowsWith(
    _BodyPaintFilter filter,
    ReportTemplateItem item,
    WorkOrderReportAnswer? answer,
  ) {
    switch (filter) {
      case _BodyPaintFilter.all:
        return true;
      case _BodyPaintFilter.missing:
        return answer?.isCompleted != true;
      case _BodyPaintFilter.completed:
        return answer?.isCompleted == true;
      case _BodyPaintFilter.measurement:
        return item.inputFields.isNotEmpty;
      case _BodyPaintFilter.evidence:
        return item.hasImages;
    }
  }

  bool _motorFilterAllowsWith(
    _MotorFilter filter,
    ReportTemplateItem item,
    WorkOrderReportAnswer? answer,
  ) {
    switch (filter) {
      case _MotorFilter.all:
        return true;
      case _MotorFilter.missing:
        return answer?.isCompleted != true;
      case _MotorFilter.completed:
        return answer?.isCompleted == true;
      case _MotorFilter.measurement:
        return item.inputFields.isNotEmpty;
      case _MotorFilter.risk:
        return _answerHasRiskSelection(item, answer);
    }
  }

  bool _mechanicalFilterAllowsWith(
    _MechanicalFilter filter,
    ReportTemplateItem item,
    WorkOrderReportAnswer? answer,
  ) {
    switch (filter) {
      case _MechanicalFilter.all:
        return true;
      case _MechanicalFilter.missing:
        return answer?.isCompleted != true;
      case _MechanicalFilter.completed:
        return answer?.isCompleted == true;
      case _MechanicalFilter.evidence:
        return item.hasImages;
      case _MechanicalFilter.risk:
        return _answerHasRiskSelection(item, answer);
    }
  }

  bool _focusedTestFilterAllowsWith(
    _FocusedTestFilter filter,
    ReportTemplateItem item,
    WorkOrderReportAnswer? answer,
  ) {
    switch (filter) {
      case _FocusedTestFilter.all:
        return true;
      case _FocusedTestFilter.missing:
        return answer?.isCompleted != true;
      case _FocusedTestFilter.completed:
        return answer?.isCompleted == true;
      case _FocusedTestFilter.measurement:
        return item.inputFields.isNotEmpty;
      case _FocusedTestFilter.evidence:
        return item.hasImages;
      case _FocusedTestFilter.risk:
        return _answerHasRiskSelection(item, answer);
    }
  }

  bool _answerHasRiskSelection(
    ReportTemplateItem item,
    WorkOrderReportAnswer? answer,
  ) {
    if (answer == null) {
      return false;
    }
    final selectedIds = answer.selectedOptionIds.toSet();
    return item.options.any(
      (option) =>
          selectedIds.contains(option.id) &&
          option.scoreType == ReportOptionScoreType.negative,
    );
  }

  Future<_ReportEntryData> _load() async {
    final repositories = AppRepositories.instance;
    final remote = repositories.remoteWorkOrders;
    if (remote == null && !repositories.hasLocalTestWorkOrders) {
      throw StateError(
        repositories.liveConnectionError ??
            'Canli veri baglantisi yok. Mock/local veri gosterilmiyor.',
      );
    }
    final template = await _templateRepository.getActiveTemplate();
    final visibleGroups = [
      for (final group in template.groups)
        if (_isTechnicianVisibleGroup(group)) group,
    ];
    final answers = await _reportRepository.getAnswers(
      widget.workOrderId,
    );
    final progressList = await _service.getReportProgress(widget.workOrderId);
    final overallPercent = _overallPercentForGroups(visibleGroups, answers);
    final order = remote == null
        ? repositories.localWorkOrders.getById(widget.workOrderId)
        : await remote.getById(widget.workOrderId);
    final currentUser =
        remote?.currentUser ?? repositories.localWorkOrders.currentUser;

    return _ReportEntryData(
      template: template,
      visibleGroups: visibleGroups,
      order: order,
      answers: answers,
      progress: {
        for (final item in progressList)
          if (visibleGroups.any((group) => group.id == item.groupId))
            item.groupId: item,
      },
      overallPercent: overallPercent,
      currentUser: currentUser,
    );
  }

  ReportTemplateGroup? _selectedVisibleGroup(_ReportEntryData data) {
    for (final group in data.visibleGroups) {
      if (group.id == _selectedGroupId) {
        return group;
      }
    }
    return null;
  }

  Future<void> _openItemForm(
    _ReportEntryData data,
    ReportTemplateGroup group,
    ReportTemplateItem item,
  ) async {
    await _reportRepository.lockItem(
      widget.workOrderId,
      item.id,
      data.currentUser.id,
    );
    if (!mounted) {
      return;
    }
    final answer = await _reportRepository.getItemAnswer(
      widget.workOrderId,
      item.id,
    );
    if (!mounted) {
      return;
    }
    final changed = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (_) => _ReportItemFormSheet(
        workOrderId: widget.workOrderId,
        template: data.template,
        group: group,
        item: item,
        answer: answer,
        user: data.currentUser,
        service: _service,
      ),
    );
    await _reportRepository.unlockItem(
      widget.workOrderId,
      item.id,
      data.currentUser.id,
    );
    if (changed == true) {
      _refresh();
    }
  }

  Future<void> _markGroupAllGood(
    _ReportEntryData data,
    ReportTemplateGroup group,
  ) async {
    final quickInputValues = mergeReportInputValuesByItem(
      sharedMicronInputValuesForGroup(
        group,
        isBodyPaintReportGroup(group) ? _bodyPaintMicronController.text : '',
      ),
      _sharedMotorInputValuesForGroup(
        group,
        antifreezeValue:
            isMotorReportGroup(group) ? _motorAntifreezeController.text : '',
        batteryValue:
            isMotorReportGroup(group) ? _motorBatteryController.text : '',
      ),
    );
    final requiredInputs = await _service.getRequiredInputsForGroupAllGood(
      workOrderId: widget.workOrderId,
      group: group,
      inputValuesByItem: quickInputValues,
    );
    if (!mounted) {
      return;
    }

    var inputValuesByItem = quickInputValues;
    if (requiredInputs.isNotEmpty) {
      final values =
          await showModalBottomSheet<Map<String, Map<String, String>>>(
        context: context,
        isScrollControlled: true,
        useSafeArea: true,
        builder: (_) => _AllGoodInputSheet(requests: requiredInputs),
      );
      if (values == null) {
        return;
      }
      inputValuesByItem = mergeReportInputValuesByItem(
        quickInputValues,
        values,
      );
    }

    try {
      await _service.markGroupAllGood(
        workOrderId: widget.workOrderId,
        template: data.template,
        group: group,
        user: data.currentUser,
        inputValuesByItem: inputValuesByItem,
      );
      _refresh();
    } catch (error) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error.toString().replaceFirst('Bad state: ', '')),
        ),
      );
    }
  }

  List<ReportTemplateOption> _bodyPaintQuickOptions(ReportTemplateItem item) {
    const preferredLabels = {
      'Orijinal',
      'Boyalı',
      'Lokal Boyalı',
      'Değişim',
      'İşlemli',
      'Hasarlı',
    };
    return [
      for (final option in item.options)
        if (!option.disabled && preferredLabels.contains(option.label)) option,
    ];
  }

  List<ReportTemplateOption> _motorQuickOptions(ReportTemplateItem item) {
    return _technicalQuickOptions(item);
  }

  List<ReportTemplateOption> _technicalQuickOptions(ReportTemplateItem item) {
    final optionsByScore = <ReportOptionScoreType, ReportTemplateOption>{};
    for (final option in item.options) {
      if (option.disabled) {
        continue;
      }
      optionsByScore.putIfAbsent(option.scoreType, () => option);
    }
    return [
      if (optionsByScore[ReportOptionScoreType.positive] != null)
        optionsByScore[ReportOptionScoreType.positive]!,
      if (optionsByScore[ReportOptionScoreType.warning] != null)
        optionsByScore[ReportOptionScoreType.warning]!,
      if (optionsByScore[ReportOptionScoreType.negative] != null)
        optionsByScore[ReportOptionScoreType.negative]!,
      if (optionsByScore[ReportOptionScoreType.neutral] != null)
        optionsByScore[ReportOptionScoreType.neutral]!,
    ];
  }

  Map<String, Map<String, String>> _sharedMotorInputValuesForGroup(
    ReportTemplateGroup group, {
    required String antifreezeValue,
    required String batteryValue,
  }) {
    final valuesByItem = <String, Map<String, String>>{};
    final normalizedAntifreeze = antifreezeValue.trim();
    final normalizedBattery = batteryValue.trim();
    if (normalizedAntifreeze.isEmpty && normalizedBattery.isEmpty) {
      return const {};
    }

    for (final item in group.items) {
      final text = _normalizeMotorText('${item.id} ${item.title}');
      final value = text.contains('ANTIFIRIZ')
          ? normalizedAntifreeze
          : text.contains('AKU')
              ? normalizedBattery
              : '';
      if (value.isEmpty) {
        continue;
      }
      final inputValues = {
        for (final input in item.inputFields) input.id: value,
      };
      if (inputValues.isNotEmpty) {
        valuesByItem[item.id] = inputValues;
      }
    }

    return valuesByItem;
  }

  Future<void> _saveQuickOption({
    required _ReportEntryData data,
    required ReportTemplateGroup group,
    required ReportTemplateItem item,
    required ReportTemplateOption option,
  }) async {
    try {
      final existing = await _reportRepository.getItemAnswer(
        widget.workOrderId,
        item.id,
      );
      await _service.saveItemAnswer(
        workOrderId: widget.workOrderId,
        template: data.template,
        group: group,
        item: item,
        user: data.currentUser,
        selectedOptionIds: [option.id],
        inputValues: existing?.inputValues ?? const {},
        description: existing?.description ?? '',
        imageUrls: existing?.imageUrls ?? const [],
        complete: option.scoreType != ReportOptionScoreType.negative &&
            item.inputFields.isEmpty &&
            item.requiredImageCount == 0,
      );
      _refresh();
    } catch (error) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error.toString().replaceFirst('Bad state: ', '')),
        ),
      );
    }
  }

  void _refresh() {
    setState(() {
      _future = _load();
    });
  }

  Future<void> _submitGroup(
    _ReportEntryData data,
    ReportTemplateGroup group,
  ) async {
    if (_isSubmittingGroup) {
      return;
    }
    setState(() => _isSubmittingGroup = true);
    try {
      await _completeLinkedTaskForGroup(data, group);
    } catch (error) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error.toString().replaceFirst('Bad state: ', '')),
        ),
      );
    } finally {
      if (mounted) {
        setState(() => _isSubmittingGroup = false);
        Navigator.pushReplacementNamed(
          context,
          AppRoutes.technicianTasks,
          arguments: widget.workOrderId,
        );
      }
    }
  }

  Future<void> _completeLinkedTaskForGroup(
    _ReportEntryData data,
    ReportTemplateGroup group,
  ) async {
    var linkedTask = _findTaskForGroup(data.order.tasks, group);
    if (linkedTask == null) {
      return;
    }
    final linkedTaskId = linkedTask.taskId;

    final remote = AppRepositories.instance.remoteWorkOrders;
    if (remote != null &&
        linkedTask.isAvailableForClaim &&
        !linkedTask.isOwnedBy(data.currentUser.id)) {
      final claimed =
          await remote.claimTask(widget.workOrderId, linkedTask.taskId);
      final matches = claimed.tasks
          .where((task) => task.taskId == linkedTaskId)
          .toList(growable: false);
      if (matches.isNotEmpty) {
        linkedTask = matches.first;
      }
    }

    if (AppRepositories.instance.hasLocalTestWorkOrders &&
        linkedTask.isAvailableForClaim &&
        !linkedTask.isOwnedBy(data.currentUser.id)) {
      final claimed = AppRepositories.instance.localWorkOrders.claimTask(
        widget.workOrderId,
        linkedTask.taskId,
      );
      final matches = claimed.tasks
          .where((task) => task.taskId == linkedTaskId)
          .toList(growable: false);
      if (matches.isNotEmpty) {
        linkedTask = matches.first;
      }
    }

    final completedTask = linkedTask.copyWith(
      checklistItems: [
        for (final item in linkedTask.checklistItems)
          item.copyWith(isAnswered: true),
      ],
      status: TaskStatus.completed,
    );

    if (remote != null) {
      final updated =
          await remote.updateTask(widget.workOrderId, completedTask);
      final savedTask = updated.tasks.firstWhere(
        (task) => task.taskId == linkedTaskId,
        orElse: () => completedTask,
      );
      if (savedTask.status != TaskStatus.completed) {
        await remote.updateTask(
          widget.workOrderId,
          savedTask.copyWith(status: TaskStatus.completed),
        );
      }
      return;
    }

    if (AppRepositories.instance.hasLocalTestWorkOrders) {
      AppRepositories.instance.localWorkOrders.updateTask(
        widget.workOrderId,
        completedTask,
      );
    }
  }

  TechnicianTask? _findTaskForGroup(
    List<TechnicianTask> tasks,
    ReportTemplateGroup group,
  ) {
    final groupItemIds = group.items.map((item) => item.id).toSet();
    final groupItemTitles = {
      for (final item in group.items) _normalize(item.title),
    };
    for (final task in tasks) {
      if (task.checklistItems.any(
        (item) =>
            groupItemIds.contains(item.id) ||
            groupItemTitles.contains(_normalize(item.title)),
      )) {
        return task;
      }
      if (_normalize(task.title) == _normalize(group.title) ||
          _normalize(task.reportFieldKey).contains(_normalize(group.code))) {
        return task;
      }
    }
    return null;
  }

  String _normalize(String value) {
    return value
        .trim()
        .toUpperCase()
        .replaceAll('İ', 'I')
        .replaceAll('Ğ', 'G')
        .replaceAll('Ü', 'U')
        .replaceAll('Ş', 'S')
        .replaceAll('Ö', 'O')
        .replaceAll('Ç', 'C')
        .replaceAll('ı', 'I')
        .replaceAll('ğ', 'G')
        .replaceAll('ü', 'U')
        .replaceAll('ş', 'S')
        .replaceAll('ö', 'O')
        .replaceAll('ç', 'C')
        .replaceAll(RegExp(r'[^A-Z0-9]+'), '_');
  }
}

bool _isTechnicianVisibleGroup(ReportTemplateGroup group) {
  final role = group.assignedRole.toLowerCase();
  const secretaryCodes = {
    'WORK_ORDER_ACCEPTANCE',
    'VEHICLE_FILE_CHECK',
  };
  return !role.contains('sekreter') &&
      !role.contains('secret') &&
      !secretaryCodes.contains(group.code);
}

String bodyPaintSectionForItem(ReportTemplateItem item) {
  final text = _normalizeBodyPaintText('${item.title} ${item.id}');
  if (text.contains('ARACTA') ||
      text.contains('ARAC_GENEL') ||
      text.contains('KIRLI') ||
      text.contains('KARALAMA') ||
      text.contains('KENDINIZE')) {
    return 'Genel Kontroller';
  }
  if (text.contains('TAVAN') || text.contains('SUNROOF')) {
    return 'Tavan ve Camlar';
  }
  if (text.contains('SASI') ||
      text.contains('PODYE') ||
      text.contains('KULE') ||
      text.contains('DIREK') ||
      text.contains('ALT_TABAN') ||
      text.contains('ALT_')) {
    return 'Şasi ve İç Yapı';
  }
  if (text.contains('ON_') ||
      text.startsWith('ON ') ||
      text.contains(' ON ') ||
      text.contains('PANJUR') ||
      text.contains('KAPUT') ||
      text.contains('ON CAM')) {
    return 'Ön Bölüm';
  }
  if (text.contains('SOL_') ||
      text.startsWith('SOL ') ||
      text.contains(' SOL ')) {
    return 'Sol Yan';
  }
  if (text.contains('SAG_') ||
      text.startsWith('SAG ') ||
      text.contains(' SAG ')) {
    return 'Sağ Yan';
  }
  if (text.contains('ARKA_') ||
      text.startsWith('ARKA ') ||
      text.contains(' ARKA ') ||
      text.contains('BAGAJ')) {
    return 'Arka Bölüm';
  }
  return 'Diğer Kaporta Noktaları';
}

String motorSectionForItem(ReportTemplateItem item) {
  final text = _normalizeMotorText('${item.id} ${item.title}');
  if (text.contains('ANTIFIRIZ') ||
      text.contains('AKU') ||
      text.contains('HIDROLIGI') ||
      text.contains('MOTOR_YAG_SEVIYESI') ||
      text.contains('YAKIT_SISTEMI') ||
      text.contains('MOTOR_SUYUNDA') ||
      text.contains('SOGUTMA_SUYU')) {
    return 'Sivi ve Bakim';
  }
  if (text.contains('V_KAYISI') ||
      text.contains('TRIGER') ||
      text.contains('RULMANI') ||
      text.contains('UFLEME') ||
      text.contains('VURUNTULU')) {
    return 'Ses ve Calisma';
  }
  if (text.contains('RADYATOR') ||
      text.contains('INTERCOOLER') ||
      text.contains('SOGUTMA_FAN') ||
      text.contains('KLIMA')) {
    return 'Sogutma ve Klima';
  }
  if (text.contains('SIZDIRMAZ') ||
      text.contains('KACAGI') ||
      text.contains('TURBO') ||
      text.contains('POMPASI')) {
    return 'Sizdirmazlik ve Turbo';
  }
  if (text.contains('EGZOZ') ||
      text.contains('KOMPRESOR') ||
      text.contains('CONTA')) {
    return 'Egzoz ve Kompresyon';
  }
  if (text.contains('KULE') ||
      text.contains('ACIL_SERVIS') ||
      text.contains('ISLEM') ||
      text.contains('KENDINIZE') ||
      text.contains('EMME_MANIFOLDU')) {
    return 'Servis Karari';
  }
  return 'Motor Genel';
}

String mechanicalSectionForItem(ReportTemplateItem item) {
  final text = _normalizeMechanicalText('${item.id} ${item.title}');
  if (text.contains('ARAC_ALT') ||
      text.contains('MOTOR_MUHAFAZA') ||
      text.contains('TABAN_PLASTIK') ||
      text.contains('BAKALIT')) {
    return 'Alt Govde ve Muhafaza';
  }
  if (text.contains('SIZDIRMAZ') ||
      text.contains('YAG_') ||
      text.contains('KARTER') ||
      text.contains('KECESI') ||
      text.contains('TURBO_ALT') ||
      text.contains('YAKIT_DEPOSU') ||
      text.contains('YAKIT_HORTUM')) {
    return 'Yag ve Sizdirmazlik';
  }
  if (text.contains('FREN') ||
      text.contains('BALATA') ||
      text.contains('DISK') ||
      text.contains('KALIPER') ||
      text.contains('HORTUM') ||
      text.contains('EL_FRENI')) {
    return 'Fren Sistemi';
  }
  if (text.contains('ON_AKS') ||
      text.contains('SOL_ON') ||
      text.contains('SAG_ON') ||
      text.contains('ON_ROT') ||
      text.contains('ROTI') ||
      text.contains('ROT_') ||
      text.contains('SALINCAK') ||
      text.contains('ON_AMORTISOR') ||
      text.contains('DIREKSIYON') ||
      text.contains('ROT_BALANS') ||
      text.contains('LASTIK')) {
    return 'On Takim ve Direksiyon';
  }
  if (text.contains('FREN') ||
      text.contains('BALATA') ||
      text.contains('DISK') ||
      text.contains('KALIPER') ||
      text.contains('HORTUM') ||
      text.contains('EL_FRENI')) {
    return 'Fren Sistemi';
  }
  if (text.contains('ARKA_AKS') ||
      text.contains('SOL_ARKA') ||
      text.contains('SAG_ARKA') ||
      text.contains('ARKA_AMORTISOR') ||
      text.contains('HELEZON') ||
      text.contains('TORSIYON') ||
      text.contains('AIRMATIK')) {
    return 'Arka Takim ve Suspansiyon';
  }
  if (text.contains('SANZIMAN') ||
      text.contains('DIFERANSIYEL') ||
      text.contains('TRANMISYON') ||
      text.contains('DEBRIYAJ') ||
      text.contains('KAVRAMA') ||
      text.contains('ARAZI_SAFTI')) {
    return 'Aktarma ve Diferansiyel';
  }
  if (text.contains('EGZOZ') ||
      text.contains('SUSTURUCU') ||
      text.contains('TAKOZ')) {
    return 'Egzoz ve Takozlar';
  }
  return 'Mekanik Genel';
}

String focusedTestSectionForItem(
  ReportTemplateGroup group,
  ReportTemplateItem item,
) {
  final code = group.code.toUpperCase();
  final text = _normalizeFocusedTestText('${item.id} ${item.title}');
  if (code == 'OBD_ECU_TEST') {
    if (text.contains('MOTOR') || text.contains('SANZIMAN')) {
      return 'Aktarma Elektronigi';
    }
    if (text.contains('ABS') ||
        text.contains('ESP') ||
        text.contains('DIREKSIYON') ||
        text.contains('LASTIK')) {
      return 'Guvenlik ve Surus Elektronigi';
    }
    if (text.contains('OBD_TEST_CIKTISI')) {
      return 'OBD Ciktisi';
    }
    return 'Govde ve Konfor Elektronigi';
  }
  if (code == 'AIRBAG_CHECK') {
    if (text.contains('ISIGI') || text.contains('IZIN_FORMU')) {
      return 'Airbag On Kosul';
    }
    if (text.contains('EMNIYET_KEMER')) {
      return 'Emniyet Kemeri';
    }
    return 'Airbag Noktalari';
  }
  if (code == 'BRAKE_SUSPENSION_TEST') {
    if (text.contains('CIKTISI')) {
      return 'Test Ciktisi';
    }
    if (text.contains('FREN')) {
      return 'Fren Testi';
    }
    if (text.contains('SUSPANSIYON')) {
      return 'Suspansiyon Testi';
    }
    return 'Fren / Suspansiyon Genel';
  }
  if (code == 'DYNO_ROAD_TEST') {
    if (text.contains('GUC') || text.contains('TORK')) {
      return 'Dyno Olcumleri';
    }
    if (text.contains('CIKTISI')) {
      return 'Dyno Ciktisi';
    }
    return 'Yol Testi';
  }
  if (code == 'HEAD_GASKET_LEAK_TEST') {
    return 'Conta Kacak Testi';
  }
  return 'Test Noktalari';
}

String _normalizeBodyPaintText(String value) {
  return value
      .trim()
      .toUpperCase()
      .replaceAll('İ', 'I')
      .replaceAll('İ', 'I')
      .replaceAll('Ğ', 'G')
      .replaceAll('Ü', 'U')
      .replaceAll('Ş', 'S')
      .replaceAll('Ö', 'O')
      .replaceAll('Ç', 'C')
      .replaceAll('ı', 'I')
      .replaceAll('ğ', 'G')
      .replaceAll('ü', 'U')
      .replaceAll('ş', 'S')
      .replaceAll('ö', 'O')
      .replaceAll('ç', 'C')
      .replaceAll(RegExp(r'[^A-Z0-9]+'), '_');
}

String _normalizeFocusedTestText(String value) {
  return value
      .trim()
      .toUpperCase()
      .replaceAll('Ä°', 'I')
      .replaceAll('IÌ‡', 'I')
      .replaceAll('Ä', 'G')
      .replaceAll('Ãœ', 'U')
      .replaceAll('Å', 'S')
      .replaceAll('Ã–', 'O')
      .replaceAll('Ã‡', 'C')
      .replaceAll('Ä±', 'I')
      .replaceAll('ÄŸ', 'G')
      .replaceAll('Ã¼', 'U')
      .replaceAll('ÅŸ', 'S')
      .replaceAll('Ã¶', 'O')
      .replaceAll('Ã§', 'C')
      .replaceAll(RegExp(r'[^A-Z0-9]+'), '_');
}

String _normalizeMechanicalText(String value) {
  return value
      .trim()
      .toUpperCase()
      .replaceAll('Ä°', 'I')
      .replaceAll('IÌ‡', 'I')
      .replaceAll('Ä', 'G')
      .replaceAll('Ãœ', 'U')
      .replaceAll('Å', 'S')
      .replaceAll('Ã–', 'O')
      .replaceAll('Ã‡', 'C')
      .replaceAll('Ä±', 'I')
      .replaceAll('ÄŸ', 'G')
      .replaceAll('Ã¼', 'U')
      .replaceAll('ÅŸ', 'S')
      .replaceAll('Ã¶', 'O')
      .replaceAll('Ã§', 'C')
      .replaceAll(RegExp(r'[^A-Z0-9]+'), '_');
}

String _normalizeMotorText(String value) {
  return value
      .trim()
      .toUpperCase()
      .replaceAll('Ä°', 'I')
      .replaceAll('IÌ‡', 'I')
      .replaceAll('Ä', 'G')
      .replaceAll('Ãœ', 'U')
      .replaceAll('Å', 'S')
      .replaceAll('Ã–', 'O')
      .replaceAll('Ã‡', 'C')
      .replaceAll('Ä±', 'I')
      .replaceAll('ÄŸ', 'G')
      .replaceAll('Ã¼', 'U')
      .replaceAll('ÅŸ', 'S')
      .replaceAll('Ã¶', 'O')
      .replaceAll('Ã§', 'C')
      .replaceAll(RegExp(r'[^A-Z0-9]+'), '_');
}

int _overallPercentForGroups(
  List<ReportTemplateGroup> groups,
  List<WorkOrderReportAnswer> answers,
) {
  final totalItems = groups.fold(0, (sum, group) => sum + group.items.length);
  if (totalItems == 0) {
    return 0;
  }
  final visibleGroupIds = groups.map((group) => group.id).toSet();
  final completed = answers
      .where(
        (answer) =>
            answer.isCompleted && visibleGroupIds.contains(answer.groupId),
      )
      .length;
  return ((completed / totalItems) * 100).round();
}

class _SubmitGroupCard extends StatelessWidget {
  const _SubmitGroupCard({
    required this.completed,
    required this.total,
    required this.isComplete,
    required this.onSubmit,
  });

  final int completed;
  final int total;
  final bool isComplete;
  final VoidCallback? onSubmit;

  @override
  Widget build(BuildContext context) {
    final missing = (total - completed).clamp(0, total);
    return OtotrCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                isComplete ? Icons.check_circle : Icons.pending_actions,
                color: isComplete ? AppColors.success : AppColors.warning,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  isComplete
                      ? 'Bu başlık tamamlandı'
                      : '$completed/$total madde tamamlandı',
                  style: const TextStyle(
                    color: AppColors.navy,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            isComplete
                ? 'Başlığı gönderip testlerin olduğu sayfaya dönebilirsiniz.'
                : '$missing madde tamamlanmadan başlık gönderilemez.',
            style: const TextStyle(
              color: AppColors.grayText,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            height: AppSizes.buttonHeight,
            child: FilledButton.icon(
              onPressed: isComplete ? onSubmit : null,
              icon: const Icon(Icons.send),
              label: const Text('Başlığı Gönder'),
            ),
          ),
        ],
      ),
    );
  }
}

class _BodyPaintQuickInputCard extends StatelessWidget {
  const _BodyPaintQuickInputCard({
    required this.group,
    required this.controller,
  });

  final ReportTemplateGroup group;
  final TextEditingController controller;

  @override
  Widget build(BuildContext context) {
    final micronPanelCount = group.items
        .where((item) => item.inputFields.any(reportInputIsMicron))
        .length;
    final evidencePointCount =
        group.items.where((item) => item.hasImages).length;

    return OtotrCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.directions_car_filled, color: AppColors.red),
              SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Kaporta Hızlı Panel Girişi',
                  style: TextStyle(
                    color: AppColors.navy,
                    fontWeight: FontWeight.w900,
                    fontSize: 17,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '${group.items.length} kaporta noktası, '
            '$micronPanelCount mikron paneli, '
            '$evidencePointCount kanıt alanı',
            style: const TextStyle(
              color: AppColors.grayText,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: controller,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            textInputAction: TextInputAction.done,
            decoration: const InputDecoration(
              labelText: 'Toplu Mikron Değeri',
              hintText: 'Örn. 160',
              prefixIcon: Icon(Icons.speed),
              helperText:
                  'Tüm noktaları iyiye çekerken mikron alanlarına uygulanır.',
            ),
          ),
        ],
      ),
    );
  }
}

class _MotorQuickInputCard extends StatelessWidget {
  const _MotorQuickInputCard({
    required this.group,
    required this.antifreezeController,
    required this.batteryController,
  });

  final ReportTemplateGroup group;
  final TextEditingController antifreezeController;
  final TextEditingController batteryController;

  @override
  Widget build(BuildContext context) {
    final measurementCount =
        group.items.where((item) => item.inputFields.isNotEmpty).length;
    final riskOptionCount = group.items
        .where(
          (item) => item.options.any(
            (option) => option.scoreType == ReportOptionScoreType.negative,
          ),
        )
        .length;

    return OtotrCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.settings, color: AppColors.info),
              SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Motor Hizli Olcum Girisi',
                  style: TextStyle(
                    color: AppColors.navy,
                    fontWeight: FontWeight.w900,
                    fontSize: 17,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '${group.items.length} motor noktasi, '
            '$measurementCount olcum alani, '
            '$riskOptionCount risk secenekli kontrol',
            style: const TextStyle(
              color: AppColors.grayText,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: antifreezeController,
                  keyboardType: TextInputType.text,
                  textInputAction: TextInputAction.next,
                  decoration: const InputDecoration(
                    labelText: 'Antifriz',
                    hintText: 'Orn. -25',
                    prefixIcon: Icon(Icons.water_drop),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: TextField(
                  controller: batteryController,
                  keyboardType:
                      const TextInputType.numberWithOptions(decimal: true),
                  textInputAction: TextInputAction.done,
                  decoration: const InputDecoration(
                    labelText: 'Aku (%)',
                    hintText: 'Orn. 82',
                    prefixIcon: Icon(Icons.battery_full),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _MechanicalQuickInfoCard extends StatelessWidget {
  const _MechanicalQuickInfoCard({required this.group});

  final ReportTemplateGroup group;

  @override
  Widget build(BuildContext context) {
    final evidencePointCount =
        group.items.where((item) => item.hasImages).length;
    final riskOptionCount = group.items
        .where(
          (item) => item.options.any(
            (option) => option.scoreType == ReportOptionScoreType.negative,
          ),
        )
        .length;

    return OtotrCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.car_repair, color: AppColors.warning),
              SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Mekanik Hizli Kontrol',
                  style: TextStyle(
                    color: AppColors.navy,
                    fontWeight: FontWeight.w900,
                    fontSize: 17,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '${group.items.length} mekanik noktasi, '
            '$evidencePointCount fotograf alani, '
            '$riskOptionCount risk secenekli kontrol',
            style: const TextStyle(
              color: AppColors.grayText,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _FocusedTestQuickInfoCard extends StatelessWidget {
  const _FocusedTestQuickInfoCard({required this.group});

  final ReportTemplateGroup group;

  @override
  Widget build(BuildContext context) {
    final measurementCount =
        group.items.where((item) => item.inputFields.isNotEmpty).length;
    final evidencePointCount =
        group.items.where((item) => item.hasImages).length;
    final requiredEvidenceCount =
        group.items.where((item) => item.requiredImageCount > 0).length;
    final riskOptionCount = group.items
        .where(
          (item) => item.options.any(
            (option) => option.scoreType == ReportOptionScoreType.negative,
          ),
        )
        .length;

    return OtotrCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(_iconFor(group), color: AppColors.info),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  _titleFor(group),
                  style: const TextStyle(
                    color: AppColors.navy,
                    fontWeight: FontWeight.w900,
                    fontSize: 17,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '${group.items.length} test noktasi, '
            '$measurementCount olcum, '
            '$evidencePointCount fotograf alani, '
            '$requiredEvidenceCount zorunlu kanit, '
            '$riskOptionCount risk secenekli kontrol',
            style: const TextStyle(
              color: AppColors.grayText,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  IconData _iconFor(ReportTemplateGroup group) {
    switch (group.code.toUpperCase()) {
      case 'OBD_ECU_TEST':
        return Icons.memory;
      case 'AIRBAG_CHECK':
        return Icons.airline_seat_recline_normal;
      case 'BRAKE_SUSPENSION_TEST':
        return Icons.speed;
      case 'DYNO_ROAD_TEST':
        return Icons.route;
      case 'HEAD_GASKET_LEAK_TEST':
        return Icons.science;
      default:
        return Icons.fact_check;
    }
  }

  String _titleFor(ReportTemplateGroup group) {
    switch (group.code.toUpperCase()) {
      case 'OBD_ECU_TEST':
        return 'OBD / Beyin Hizli Kontrol';
      case 'AIRBAG_CHECK':
        return 'Airbag Hizli Kontrol';
      case 'BRAKE_SUSPENSION_TEST':
        return 'Fren ve Suspansiyon Test Kontrolu';
      case 'DYNO_ROAD_TEST':
        return 'Dyno ve Yol Test Kontrolu';
      case 'HEAD_GASKET_LEAK_TEST':
        return 'Conta Kacak Test Kontrolu';
      default:
        return 'Test Hizli Kontrol';
    }
  }
}

class _BodyPaintFilterCard extends StatelessWidget {
  const _BodyPaintFilterCard({
    required this.selected,
    required this.counts,
    required this.onChanged,
  });

  final _BodyPaintFilter selected;
  final Map<_BodyPaintFilter, int> counts;
  final ValueChanged<_BodyPaintFilter> onChanged;

  @override
  Widget build(BuildContext context) {
    return OtotrCard(
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            for (final filter in _BodyPaintFilter.values) ...[
              ChoiceChip(
                label: Text('${_labelFor(filter)} ${counts[filter] ?? 0}'),
                selected: selected == filter,
                selectedColor: AppColors.navy.withAlpha(32),
                backgroundColor: AppColors.white,
                side: BorderSide(
                  color: selected == filter
                      ? AppColors.navy
                      : AppColors.grayBorder,
                ),
                labelStyle: TextStyle(
                  color:
                      selected == filter ? AppColors.navy : AppColors.grayText,
                  fontWeight: FontWeight.w900,
                ),
                onSelected: (_) => onChanged(filter),
              ),
              const SizedBox(width: 8),
            ],
          ],
        ),
      ),
    );
  }

  String _labelFor(_BodyPaintFilter filter) {
    switch (filter) {
      case _BodyPaintFilter.all:
        return 'Tümü';
      case _BodyPaintFilter.missing:
        return 'Eksik';
      case _BodyPaintFilter.completed:
        return 'Tamamlanan';
      case _BodyPaintFilter.measurement:
        return 'Ölçüm';
      case _BodyPaintFilter.evidence:
        return 'Kanıt';
    }
  }
}

class _MotorFilterCard extends StatelessWidget {
  const _MotorFilterCard({
    required this.selected,
    required this.counts,
    required this.onChanged,
  });

  final _MotorFilter selected;
  final Map<_MotorFilter, int> counts;
  final ValueChanged<_MotorFilter> onChanged;

  @override
  Widget build(BuildContext context) {
    return OtotrCard(
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            for (final filter in _MotorFilter.values) ...[
              ChoiceChip(
                label: Text('${_labelFor(filter)} ${counts[filter] ?? 0}'),
                selected: selected == filter,
                selectedColor: AppColors.info.withAlpha(32),
                backgroundColor: AppColors.white,
                side: BorderSide(
                  color: selected == filter
                      ? AppColors.info
                      : AppColors.grayBorder,
                ),
                labelStyle: TextStyle(
                  color:
                      selected == filter ? AppColors.info : AppColors.grayText,
                  fontWeight: FontWeight.w900,
                ),
                onSelected: (_) => onChanged(filter),
              ),
              const SizedBox(width: 8),
            ],
          ],
        ),
      ),
    );
  }

  String _labelFor(_MotorFilter filter) {
    switch (filter) {
      case _MotorFilter.all:
        return 'Tumu';
      case _MotorFilter.missing:
        return 'Eksik';
      case _MotorFilter.completed:
        return 'Tamamlanan';
      case _MotorFilter.measurement:
        return 'Olcum';
      case _MotorFilter.risk:
        return 'Risk';
    }
  }
}

class _MechanicalFilterCard extends StatelessWidget {
  const _MechanicalFilterCard({
    required this.selected,
    required this.counts,
    required this.onChanged,
  });

  final _MechanicalFilter selected;
  final Map<_MechanicalFilter, int> counts;
  final ValueChanged<_MechanicalFilter> onChanged;

  @override
  Widget build(BuildContext context) {
    return OtotrCard(
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            for (final filter in _MechanicalFilter.values) ...[
              ChoiceChip(
                label: Text('${_labelFor(filter)} ${counts[filter] ?? 0}'),
                selected: selected == filter,
                selectedColor: AppColors.warning.withAlpha(32),
                backgroundColor: AppColors.white,
                side: BorderSide(
                  color: selected == filter
                      ? AppColors.warning
                      : AppColors.grayBorder,
                ),
                labelStyle: TextStyle(
                  color: selected == filter
                      ? AppColors.warning
                      : AppColors.grayText,
                  fontWeight: FontWeight.w900,
                ),
                onSelected: (_) => onChanged(filter),
              ),
              const SizedBox(width: 8),
            ],
          ],
        ),
      ),
    );
  }

  String _labelFor(_MechanicalFilter filter) {
    switch (filter) {
      case _MechanicalFilter.all:
        return 'Tumu';
      case _MechanicalFilter.missing:
        return 'Eksik';
      case _MechanicalFilter.completed:
        return 'Tamamlanan';
      case _MechanicalFilter.evidence:
        return 'Kanit';
      case _MechanicalFilter.risk:
        return 'Risk';
    }
  }
}

class _FocusedTestFilterCard extends StatelessWidget {
  const _FocusedTestFilterCard({
    required this.selected,
    required this.counts,
    required this.onChanged,
  });

  final _FocusedTestFilter selected;
  final Map<_FocusedTestFilter, int> counts;
  final ValueChanged<_FocusedTestFilter> onChanged;

  @override
  Widget build(BuildContext context) {
    return OtotrCard(
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            for (final filter in _FocusedTestFilter.values) ...[
              ChoiceChip(
                label: Text('${_labelFor(filter)} ${counts[filter] ?? 0}'),
                selected: selected == filter,
                selectedColor: AppColors.info.withAlpha(32),
                backgroundColor: AppColors.white,
                side: BorderSide(
                  color: selected == filter
                      ? AppColors.info
                      : AppColors.grayBorder,
                ),
                labelStyle: TextStyle(
                  color:
                      selected == filter ? AppColors.info : AppColors.grayText,
                  fontWeight: FontWeight.w900,
                ),
                onSelected: (_) => onChanged(filter),
              ),
              const SizedBox(width: 8),
            ],
          ],
        ),
      ),
    );
  }

  String _labelFor(_FocusedTestFilter filter) {
    switch (filter) {
      case _FocusedTestFilter.all:
        return 'Tumu';
      case _FocusedTestFilter.missing:
        return 'Eksik';
      case _FocusedTestFilter.completed:
        return 'Tamamlanan';
      case _FocusedTestFilter.measurement:
        return 'Olcum';
      case _FocusedTestFilter.evidence:
        return 'Kanit';
      case _FocusedTestFilter.risk:
        return 'Risk';
    }
  }
}

class _ReportSectionHeader extends StatelessWidget {
  const _ReportSectionHeader({
    required this.title,
    required this.completed,
    required this.total,
    required this.color,
  });

  final String title;
  final int completed;
  final int total;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final isComplete = total > 0 && completed >= total;
    return Padding(
      padding: const EdgeInsets.only(top: 6, bottom: 4),
      child: Row(
        children: [
          Container(
            width: 4,
            height: 22,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(999),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              title,
              style: const TextStyle(
                color: AppColors.navy,
                fontWeight: FontWeight.w900,
                fontSize: 16,
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: (isComplete ? AppColors.success : AppColors.warning)
                  .withAlpha(28),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: (isComplete ? AppColors.success : AppColors.warning)
                    .withAlpha(76),
              ),
            ),
            child: Text(
              '$completed/$total',
              style: TextStyle(
                color: isComplete ? AppColors.success : AppColors.warning,
                fontWeight: FontWeight.w900,
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ReportEntryData {
  const _ReportEntryData({
    required this.template,
    required this.visibleGroups,
    required this.order,
    required this.answers,
    required this.progress,
    required this.overallPercent,
    required this.currentUser,
  });

  final ReportTemplate template;
  final List<ReportTemplateGroup> visibleGroups;
  final TechnicianWorkOrder order;
  final List<WorkOrderReportAnswer> answers;
  final Map<String, ReportGroupProgress> progress;
  final int overallPercent;
  final UserProfile currentUser;
}

class _OverallProgressCard extends StatelessWidget {
  const _OverallProgressCard({required this.percent});

  final int percent;

  @override
  Widget build(BuildContext context) {
    return OtotrCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Toplam İş Emri Tamamlanma',
            style: TextStyle(
              color: AppColors.navy,
              fontWeight: FontWeight.w900,
              fontSize: 17,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(999),
                  child: LinearProgressIndicator(
                    minHeight: 9,
                    value: percent / 100,
                    color: AppColors.success,
                    backgroundColor: AppColors.grayBorder,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Text(
                '%$percent',
                style: const TextStyle(
                  color: AppColors.success,
                  fontWeight: FontWeight.w900,
                  fontSize: 18,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _GroupProgressCard extends StatelessWidget {
  const _GroupProgressCard({
    required this.group,
    required this.progress,
    required this.onTap,
  });

  final ReportTemplateGroup group;
  final ReportGroupProgress? progress;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final completed = progress?.completedItems ?? 0;
    final total = progress?.totalItems ?? group.items.length;
    final percent = progress?.progressPercent ?? 0;
    final missing = (total - completed).clamp(0, total);
    final inputCount =
        group.items.where((item) => item.inputFields.isNotEmpty).length;
    final mediaCount = group.items.where((item) => item.hasImages).length;

    return OtotrCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  group.title,
                  style: const TextStyle(
                    color: AppColors.darkText,
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              Text(
                '%$percent',
                style: const TextStyle(
                  color: AppColors.success,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '${group.assignedRole} · $completed/$total tamamlandı',
            style: const TextStyle(
              color: AppColors.grayText,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _GroupMetaPill(
                icon: Icons.fact_check,
                label: '$total nokta',
              ),
              _GroupMetaPill(
                icon: missing == 0 ? Icons.check_circle : Icons.pending,
                label: missing == 0 ? 'Tamamlandi' : '$missing kalan',
                tone: missing == 0 ? AppColors.success : AppColors.warning,
              ),
              if (inputCount > 0)
                _GroupMetaPill(
                  icon: Icons.speed,
                  label: '$inputCount olcum',
                ),
              if (mediaCount > 0)
                _GroupMetaPill(
                  icon: Icons.photo_camera,
                  label: '$mediaCount kanit',
                ),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              minHeight: 8,
              value: total == 0 ? 0 : percent / 100,
              color: AppColors.success,
              backgroundColor: AppColors.grayBorder,
            ),
          ),
        ],
      ),
    );
  }
}

class _GroupMetaPill extends StatelessWidget {
  const _GroupMetaPill({
    required this.icon,
    required this.label,
    this.tone = AppColors.grayText,
  });

  final IconData icon;
  final String label;
  final Color tone;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: tone.withAlpha(24),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: tone.withAlpha(72)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: tone, size: 16),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              color: tone,
              fontWeight: FontWeight.w900,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}

class _ReportItemCard extends StatelessWidget {
  const _ReportItemCard({
    required this.item,
    required this.answer,
    required this.onTap,
    this.quickOptions = const [],
    this.onQuickOptionSelected,
  });

  final ReportTemplateItem item;
  final WorkOrderReportAnswer? answer;
  final VoidCallback onTap;
  final List<ReportTemplateOption> quickOptions;
  final ValueChanged<ReportTemplateOption>? onQuickOptionSelected;

  @override
  Widget build(BuildContext context) {
    final completed = answer?.isCompleted ?? false;
    final hasPhoto = answer?.imageUrls.isNotEmpty ?? false;
    final hasDescription = answer?.description.trim().isNotEmpty ?? false;
    final inputSummary = answer?.inputValues.values
        .where((value) => value.isNotEmpty)
        .join(', ');
    final optionSummary = answer?.selectedOptionLabels.join(', ') ?? '';
    final summary = answer == null
        ? 'Bekliyor'
        : [
            if (!completed) 'Taslak',
            if (optionSummary.isNotEmpty) optionSummary,
            if (inputSummary != null && inputSummary.isNotEmpty) inputSummary,
          ].join(' · ');

    return OtotrCard(
      onTap: onTap,
      child: Row(
        children: [
          Icon(
            completed ? Icons.check_circle : Icons.radio_button_unchecked,
            color: completed ? AppColors.success : AppColors.grayText,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.title,
                  style: const TextStyle(
                    color: AppColors.darkText,
                    fontWeight: FontWeight.w900,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  summary.isEmpty ? 'Kaydedildi' : summary,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: AppColors.grayText,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                if (item.inputFields.isNotEmpty ||
                    item.requiredImageCount > 0) ...[
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      if (item.inputFields.isNotEmpty)
                        const _RequirementPill(
                          icon: Icons.speed,
                          label: 'Ölçüm gerekli',
                        ),
                      if (item.requiredImageCount > 0)
                        _RequirementPill(
                          icon: Icons.photo_camera,
                          label: '${item.requiredImageCount} kanıt gerekli',
                        ),
                    ],
                  ),
                ],
                if (quickOptions.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      for (final option in quickOptions)
                        _QuickOptionChip(
                          option: option,
                          selected:
                              answer?.selectedOptionIds.contains(option.id) ??
                                  false,
                          onTap: onQuickOptionSelected == null
                              ? null
                              : () => onQuickOptionSelected!(option),
                        ),
                    ],
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(width: 8),
          Icon(
            hasDescription ? Icons.notes : Icons.notes_outlined,
            color: hasDescription ? AppColors.info : AppColors.grayText,
            size: 20,
          ),
          const SizedBox(width: 6),
          Icon(
            hasPhoto ? Icons.photo_camera : Icons.photo_camera_outlined,
            color: hasPhoto ? AppColors.success : AppColors.grayText,
            size: 20,
          ),
        ],
      ),
    );
  }
}

class _QuickOptionChip extends StatelessWidget {
  const _QuickOptionChip({
    required this.option,
    required this.selected,
    required this.onTap,
  });

  final ReportTemplateOption option;
  final bool selected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final color = _tone(option.colorType);
    return ActionChip(
      avatar: Icon(
        selected ? Icons.check_circle : Icons.touch_app,
        color: color,
        size: 16,
      ),
      label: Text(option.label),
      labelStyle: TextStyle(
        color: selected ? color : AppColors.darkText,
        fontWeight: FontWeight.w900,
        fontSize: 12,
      ),
      backgroundColor: selected ? color.withAlpha(36) : AppColors.white,
      side: BorderSide(color: selected ? color : AppColors.grayBorder),
      onPressed: onTap,
      padding: const EdgeInsets.symmetric(horizontal: 4),
    );
  }

  Color _tone(ReportOptionColorType type) {
    switch (type) {
      case ReportOptionColorType.green:
        return AppColors.success;
      case ReportOptionColorType.red:
        return AppColors.red;
      case ReportOptionColorType.orange:
        return AppColors.warning;
      case ReportOptionColorType.blue:
        return AppColors.info;
      case ReportOptionColorType.gray:
      case ReportOptionColorType.neutral:
        return AppColors.grayText;
    }
  }
}

class _RequirementPill extends StatelessWidget {
  const _RequirementPill({
    required this.icon,
    required this.label,
  });

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.warning.withAlpha(24),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.warning.withAlpha(72)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: AppColors.warning, size: 14),
          const SizedBox(width: 5),
          Text(
            label,
            style: const TextStyle(
              color: AppColors.warning,
              fontWeight: FontWeight.w900,
              fontSize: 11,
            ),
          ),
        ],
      ),
    );
  }
}

class _ReportItemFormSheet extends StatefulWidget {
  const _ReportItemFormSheet({
    required this.workOrderId,
    required this.template,
    required this.group,
    required this.item,
    required this.answer,
    required this.user,
    required this.service,
  });

  final String workOrderId;
  final ReportTemplate template;
  final ReportTemplateGroup group;
  final ReportTemplateItem item;
  final WorkOrderReportAnswer? answer;
  final UserProfile user;
  final WorkOrderReportService service;

  @override
  State<_ReportItemFormSheet> createState() => _ReportItemFormSheetState();
}

class _ReportItemFormSheetState extends State<_ReportItemFormSheet> {
  late final TextEditingController _descriptionController;
  late final Map<String, TextEditingController> _inputControllers;
  late List<String> _selectedOptionIds;
  late List<String> _imageUrls;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _selectedOptionIds = [...?widget.answer?.selectedOptionIds];
    _imageUrls = [...?widget.answer?.imageUrls];
    _descriptionController = TextEditingController(
      text: widget.answer?.description ?? '',
    );
    _inputControllers = {
      for (final input in widget.item.inputFields)
        input.id: TextEditingController(
          text: widget.answer?.inputValues[input.id] ?? input.value,
        ),
    };
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    for (final controller in _inputControllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;
    final imageSlotCount = widget.item.maxImages > 0
        ? widget.item.maxImages.clamp(1, 3).toInt()
        : 3;
    return Padding(
      padding: EdgeInsets.fromLTRB(16, 12, 16, bottomInset + 16),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Center(
              child: Container(
                width: 44,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.grayBorder,
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              widget.item.modalTitle.isEmpty
                  ? widget.item.title
                  : widget.item.modalTitle,
              style: const TextStyle(
                color: AppColors.navy,
                fontSize: 20,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              '${widget.group.title} · Nokta ${widget.item.noktaId}',
              style: const TextStyle(
                color: AppColors.grayText,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 16),
            if (widget.item.options.isNotEmpty) ...[
              Column(
                children: [
                  for (final option in widget.item.options)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: _OptionChip(
                        option: option,
                        selected: _selectedOptionIds.contains(option.id),
                        onTap: () => _toggleOption(option),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 16),
            ],
            for (final input in widget.item.inputFields) ...[
              TextField(
                controller: _inputControllers[input.id],
                keyboardType: input.type == 'number'
                    ? TextInputType.number
                    : TextInputType.text,
                decoration: InputDecoration(
                  labelText: input.label.isEmpty ? input.name : input.label,
                  hintText: input.placeholder,
                ),
              ),
              const SizedBox(height: 12),
            ],
            if (widget.item.hasDescription) ...[
              TextField(
                controller: _descriptionController,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Açıklama',
                  hintText: 'Gerekli notu yazın',
                ),
              ),
              const SizedBox(height: 12),
            ],
            if (widget.item.hasImages) ...[
              OutlinedButton.icon(
                key: ValueKey(imageSlotCount),
                onPressed: _saving ? null : _addImage,
                icon: const Icon(Icons.photo_camera),
                label: Text(
                  _imageUrls.isEmpty
                      ? 'Fotoğraf Kanıtı Ekle'
                      : '${_imageUrls.length} fotoğraf eklendi',
                ),
              ),
              const SizedBox(height: 12),
            ],
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _saving ? null : () => _save(complete: false),
                    icon: const Icon(Icons.save_outlined),
                    label: const Text('Kaydet'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: FilledButton.icon(
                    onPressed: _saving ? null : () => _save(complete: true),
                    icon: _saving
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.check),
                    label: const Text('Tamamlandı'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _toggleOption(ReportTemplateOption option) {
    if (option.disabled) {
      return;
    }
    setState(() {
      if (widget.item.allowsMultipleOptions) {
        if (_selectedOptionIds.contains(option.id)) {
          _selectedOptionIds.remove(option.id);
        } else {
          _selectedOptionIds.add(option.id);
        }
      } else {
        _selectedOptionIds = [option.id];
      }
    });
  }

  Future<void> _addImage() async {
    if (widget.item.maxImages > 0 &&
        _imageUrls.length >= widget.item.maxImages) {
      return;
    }

    final picked = await ImagePicker().pickImage(
      source: ImageSource.camera,
      imageQuality: 82,
      maxWidth: 1800,
    );
    if (picked == null) {
      return;
    }

    setState(() => _imageUrls.add(picked.path));
    unawaited(_uploadImageInBackground(picked.path));
  }

  Future<void> _uploadImageInBackground(String localPath) async {
    final supabaseClient = _activeSupabaseClient();
    if (supabaseClient == null) {
      return;
    }
    final uploader = PhotoUploadService(client: supabaseClient);
    final result = await uploader.uploadReportPhoto(
      workOrderId: widget.workOrderId,
      itemId: widget.item.id,
      localPath: localPath,
    );
    if (!mounted || !result.uploaded) {
      return;
    }
    setState(() {
      final index = _imageUrls.indexOf(localPath);
      if (index >= 0) {
        _imageUrls[index] = result.reference;
      }
    });
  }

  SupabaseClient? _activeSupabaseClient() {
    if (AppRepositories.instance.remoteWorkOrders == null) {
      return null;
    }
    try {
      return Supabase.instance.client;
    } catch (_) {
      return null;
    }
  }

  Future<void> _save({required bool complete}) async {
    setState(() => _saving = true);
    try {
      await widget.service.saveItemAnswer(
        workOrderId: widget.workOrderId,
        template: widget.template,
        group: widget.group,
        item: widget.item,
        user: widget.user,
        selectedOptionIds: _selectedOptionIds,
        inputValues: {
          for (final entry in _inputControllers.entries)
            entry.key: entry.value.text,
        },
        description: _descriptionController.text,
        imageUrls: _imageUrls,
        complete: complete,
      );
      if (!mounted) {
        return;
      }
      Navigator.pop(context, true);
    } catch (error) {
      if (!mounted) {
        return;
      }
      setState(() => _saving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(error.toString().replaceFirst('Bad state: ', ''))),
      );
    }
  }
}

class _AllGoodInputSheet extends StatefulWidget {
  const _AllGoodInputSheet({required this.requests});

  final List<ReportAllGoodInputRequest> requests;

  @override
  State<_AllGoodInputSheet> createState() => _AllGoodInputSheetState();
}

class _AllGoodInputSheetState extends State<_AllGoodInputSheet> {
  late final Map<String, TextEditingController> _controllers;
  String _errorText = '';

  @override
  void initState() {
    super.initState();
    _controllers = {
      for (final request in widget.requests)
        _controllerKey(request): TextEditingController(),
    };
  }

  @override
  void dispose() {
    for (final controller in _controllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;
    return Padding(
      padding: EdgeInsets.fromLTRB(16, 12, 16, bottomInset + 16),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Center(
              child: Container(
                width: 44,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.grayBorder,
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Ölçüm Değerleri Gerekli',
              style: TextStyle(
                color: AppColors.navy,
                fontSize: 20,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Bu başlıkta sahadan girilmesi gereken değerler var. '
              'Değerleri girmeden tamamını iyiye çekemeyiz.',
              style: TextStyle(
                color: AppColors.grayText,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 16),
            for (final request in widget.requests) ...[
              Text(
                request.item.title,
                style: const TextStyle(
                  color: AppColors.darkText,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: _controllers[_controllerKey(request)],
                keyboardType: _keyboardType(request.input.type),
                decoration: InputDecoration(
                  labelText: request.label,
                  hintText: _hintFor(request.input),
                ),
              ),
              const SizedBox(height: 12),
            ],
            if (_errorText.isNotEmpty) ...[
              Text(
                _errorText,
                style: const TextStyle(
                  color: AppColors.red,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 12),
            ],
            SizedBox(
              width: double.infinity,
              height: AppSizes.buttonHeight,
              child: FilledButton.icon(
                onPressed: _submit,
                icon: const Icon(Icons.done_all),
                label: const Text('Değerlerle İyiye Çek'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  TextInputType _keyboardType(String type) {
    switch (type.toLowerCase()) {
      case 'number':
        return const TextInputType.numberWithOptions(decimal: true);
      case 'year':
        return TextInputType.number;
      case 'date':
        return TextInputType.datetime;
      default:
        return TextInputType.text;
    }
  }

  String _hintFor(ReportTemplateInputField input) {
    if (input.placeholder.trim().isNotEmpty) {
      return input.placeholder;
    }
    switch (input.type.toLowerCase()) {
      case 'number':
        return 'Örn. 12.6';
      case 'year':
        return 'Örn. 2023';
      case 'date':
        return 'GG.AA.YYYY';
      default:
        return 'Değeri girin';
    }
  }

  void _submit() {
    final values = <String, Map<String, String>>{};
    final missing = <String>[];
    for (final request in widget.requests) {
      final value = _controllers[_controllerKey(request)]?.text.trim() ?? '';
      if (value.isEmpty) {
        missing.add(request.label);
        continue;
      }
      final itemValues =
          values.putIfAbsent(request.item.id, () => <String, String>{});
      itemValues[request.input.id] = value;
    }

    if (missing.isNotEmpty) {
      setState(() {
        _errorText = 'Boş bırakılamaz: ${missing.join(', ')}';
      });
      return;
    }

    Navigator.pop(context, values);
  }

  String _controllerKey(ReportAllGoodInputRequest request) {
    return '${request.item.id}.${request.input.id}';
  }
}

class _OptionChip extends StatelessWidget {
  const _OptionChip({
    required this.option,
    required this.selected,
    required this.onTap,
  });

  final ReportTemplateOption option;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final color = _tone(option.colorType);
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        width: double.infinity,
        constraints: const BoxConstraints(minHeight: 42),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: selected ? color.withAlpha(48) : _softTone(option.colorType),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: selected ? color : color.withAlpha(92)),
        ),
        child: Row(
          children: [
            Icon(
              selected
                  ? Icons.radio_button_checked
                  : Icons.radio_button_unchecked,
              color: color,
              size: 20,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                option.label,
                style: const TextStyle(
                  color: AppColors.darkText,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _softTone(ReportOptionColorType type) {
    switch (type) {
      case ReportOptionColorType.green:
        return const Color(0xFFEAF7F0);
      case ReportOptionColorType.red:
        return const Color(0xFFFFECEC);
      case ReportOptionColorType.orange:
        return const Color(0xFFFFF7D6);
      case ReportOptionColorType.blue:
        return const Color(0xFFEAF1FF);
      case ReportOptionColorType.gray:
      case ReportOptionColorType.neutral:
        return AppColors.white;
    }
  }

  Color _tone(ReportOptionColorType type) {
    switch (type) {
      case ReportOptionColorType.green:
        return AppColors.success;
      case ReportOptionColorType.red:
        return AppColors.red;
      case ReportOptionColorType.orange:
        return AppColors.warning;
      case ReportOptionColorType.blue:
        return AppColors.info;
      case ReportOptionColorType.gray:
      case ReportOptionColorType.neutral:
        return AppColors.grayText;
    }
  }
}
