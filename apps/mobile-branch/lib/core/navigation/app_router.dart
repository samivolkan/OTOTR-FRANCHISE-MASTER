import 'package:flutter/material.dart';

import '../../features/auth/auth_state_screen.dart';
import '../../features/auth/branch_selection_screen.dart';
import '../../features/auth/login_screen.dart';
import '../../features/auth/password_reset_screen.dart';
import '../../features/branch/branch_kpi_screen.dart';
import '../../features/branch/branch_settings_screen.dart';
import '../../features/customer/customer_info_screen.dart';
import '../../features/dashboard/branch_dashboard_screen.dart';
import '../../features/inspection/inspection_module_detail_screen.dart';
import '../../features/inspection/inspection_modules_screen.dart';
import '../../features/inspection/inspection_progress_screen.dart';
import '../../features/mobile_workflow/usta_operation_v1_screen.dart';
import '../../features/packages/package_selection_screen.dart';
import '../../features/photo_evidence/photo_evidence_screen.dart';
import '../../features/profile/profile_screen.dart';
import '../../features/reports/final_report_preview_screen.dart';
import '../../features/reports/report_preview_screen.dart';
import '../../features/technician/report_entry/report_entry_screen.dart';
import '../../features/technician/start_proof_success_screen.dart';
import '../../features/splash/splash_screen.dart';
import '../../features/technician/start_evidence_screen.dart';
import '../../features/technician/locked_section_warning_screen.dart';
import '../../features/technician/manager_task_ownership_request_screen.dart';
import '../../features/technician/technician_evidence_screen.dart';
import '../../features/technician/technician_jobs_screen.dart';
import '../../features/technician/technician_queries_screen.dart';
import '../../features/technician/technician_report_gate_screen.dart';
import '../../features/technician/technician_task_form_screen.dart';
import '../../features/technician/technician_tasks_screen.dart';
import '../../features/vehicle_intake/vehicle_intake_screen.dart';
import '../../features/work_orders/new_work_order_screen.dart';
import '../../features/work_orders/work_order_detail_screen.dart';
import '../../features/work_orders/work_order_summary_screen.dart';
import '../../features/work_orders/work_orders_list_screen.dart';
import '../../data/repositories/app_repositories.dart';
import 'app_routes.dart';

class AppRouter {
  const AppRouter._();

  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    final Widget screen = switch (settings.name) {
      AppRoutes.splash => const SplashScreen(),
      AppRoutes.login => const LoginScreen(),
      AppRoutes.branchSelection => const BranchSelectionScreen(),
      AppRoutes.passwordReset => const PasswordResetScreen(),
      AppRoutes.passwordCode => OtpVerificationScreen(
          args: settings.arguments is PasswordRecoveryFlowArgs
              ? settings.arguments as PasswordRecoveryFlowArgs
              : null,
        ),
      AppRoutes.newPassword => NewPasswordScreen(
          args: settings.arguments is PasswordRecoveryFlowArgs
              ? settings.arguments as PasswordRecoveryFlowArgs
              : null,
        ),
      AppRoutes.invalidPassword => const AuthStateScreen(
          kind: AuthStateKind.invalidPassword,
        ),
      AppRoutes.noInternet => const AuthStateScreen(
          kind: AuthStateKind.noInternet,
        ),
      AppRoutes.sessionExpired => const AuthStateScreen(
          kind: AuthStateKind.sessionExpired,
        ),
      AppRoutes.unauthorized => const AuthStateScreen(
          kind: AuthStateKind.unauthorized,
        ),
      AppRoutes.offlineLoginBlocked => const AuthStateScreen(
          kind: AuthStateKind.offlineLoginBlocked,
        ),
      AppRoutes.dashboard => const UstaOperationV1Screen(),
      AppRoutes.workOrders => const WorkOrdersListScreen(),
      AppRoutes.newWorkOrder => const NewWorkOrderScreen(),
      AppRoutes.vehicleIntake => const VehicleIntakeScreen(),
      AppRoutes.customerInfo => const CustomerInfoScreen(),
      AppRoutes.packageSelection => const PackageSelectionScreen(),
      AppRoutes.workOrderSummary => const WorkOrderSummaryScreen(),
      AppRoutes.workOrderDetail => const WorkOrderDetailScreen(),
      AppRoutes.inspectionModules => const InspectionModulesScreen(),
      AppRoutes.inspectionProgress => const InspectionProgressScreen(),
      AppRoutes.inspectionModuleDetail =>
        InspectionModuleDetailScreen(moduleId: settings.arguments as String?),
      AppRoutes.photoEvidence => const PhotoEvidenceScreen(),
      AppRoutes.reportPreview => const ReportPreviewScreen(),
      AppRoutes.finalReportPreview => FinalReportPreviewScreen(
          workOrderId: settings.arguments as String,
        ),
      AppRoutes.branchSettings => const BranchSettingsScreen(),
      AppRoutes.branchKpi => const BranchKpiScreen(),
      AppRoutes.profile => const ProfileScreen(),
      AppRoutes.technicianJobs => const TechnicianJobsScreen(),
      AppRoutes.technicianJobDetail => TechnicianJobDetailScreen(
          workOrderId: settings.arguments as String,
        ),
      AppRoutes.technicianStartEvidence => StartEvidenceScreen(
          workOrderId: settings.arguments as String,
        ),
      AppRoutes.technicianTasks => TechnicianTasksScreen(
          workOrderId: settings.arguments as String,
        ),
      AppRoutes.technicianStartProofSuccess =>
        StartProofSuccessScreen(workOrderId: settings.arguments as String),
      AppRoutes.technicianReportEntry => ReportEntryScreen(
          workOrderId: settings.arguments as String,
        ),
      AppRoutes.technicianTaskForm => _guardedTaskForm(settings),
      AppRoutes.lockedSectionWarning => _guardedLockedSectionWarning(settings),
      AppRoutes.managerTaskOwnershipRequest =>
        _guardedManagerTaskOwnershipRequest(settings),
      AppRoutes.technicianEvidence => TechnicianEvidenceScreen(
          workOrderId: settings.arguments as String,
        ),
      AppRoutes.technicianQueries => TechnicianQueriesScreen(
          workOrderId: settings.arguments as String,
        ),
      AppRoutes.technicianReportGate => TechnicianReportGateScreen(
          workOrderId: settings.arguments as String,
        ),
      _ => const BranchDashboardScreen(),
    };

    return MaterialPageRoute<void>(
      builder: (_) => screen,
      settings: settings,
    );
  }

  static Widget _guardedTaskForm(RouteSettings settings) {
    final args = settings.arguments as Map<String, dynamic>? ?? {};
    final workOrderId = args['workOrderId'];
    final taskId = args['taskId'];
    final readOnly = args['readOnly'] == true;
    if (workOrderId is! String || taskId is! String) {
      return const BranchDashboardScreen();
    }
    if (AppRepositories.instance.hasRemoteWorkOrders) {
      return TechnicianTaskFormScreen(
        workOrderId: workOrderId,
        taskId: taskId,
        readOnly: readOnly,
      );
    }
    return TechnicianTaskFormScreen(
      workOrderId: workOrderId,
      taskId: taskId,
      readOnly: readOnly,
    );
  }

  static Widget _guardedLockedSectionWarning(RouteSettings settings) {
    final args = settings.arguments as Map<String, dynamic>? ?? {};
    final workOrderId = args['workOrderId'];
    final taskId = args['taskId'];
    final sectionName = args['sectionName'];
    final lockedBy = args['lockedBy'];
    final lockedAt = args['lockedAt'];
    if (workOrderId is! String || taskId is! String) {
      return const BranchDashboardScreen();
    }
    return LockedSectionWarningScreen(
      workOrderId: workOrderId,
      taskId: taskId,
      sectionName: sectionName is String ? sectionName : 'Bilinmeyen Başlık',
      lockedBy: lockedBy is String ? lockedBy : 'Bilinmiyor',
      lockedAt: lockedAt is String ? lockedAt : '',
    );
  }

  static Widget _guardedManagerTaskOwnershipRequest(RouteSettings settings) {
    final args = settings.arguments as Map<String, dynamic>? ?? {};
    final workOrderId = args['workOrderId'];
    final taskId = args['taskId'];
    final sectionName = args['sectionName'];
    final lockedBy = args['lockedBy'];
    if (workOrderId is! String || taskId is! String) {
      return const BranchDashboardScreen();
    }
    return ManagerTaskOwnershipRequestScreen(
      workOrderId: workOrderId,
      taskId: taskId,
      sectionName: sectionName is String ? sectionName : 'Bilinmeyen Başlık',
      lockedBy: lockedBy is String ? lockedBy : 'Bilinmiyor',
    );
  }
}
