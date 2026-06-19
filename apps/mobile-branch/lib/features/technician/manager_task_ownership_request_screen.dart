import 'package:flutter/material.dart';

import '../../core/constants/app_sizes.dart';
import '../../core/navigation/app_routes.dart';
import '../../core/theme/app_colors.dart';

class ManagerTaskOwnershipRequestScreen extends StatefulWidget {
  const ManagerTaskOwnershipRequestScreen({
    super.key,
    required this.workOrderId,
    required this.taskId,
    required this.sectionName,
    required this.lockedBy,
  });

  final String workOrderId;
  final String taskId;
  final String sectionName;
  final String lockedBy;

  @override
  State<ManagerTaskOwnershipRequestScreen> createState() =>
      _ManagerTaskOwnershipRequestScreenState();
}

class _ManagerTaskOwnershipRequestScreenState
    extends State<ManagerTaskOwnershipRequestScreen> {
  final _reasonController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _reasonController.dispose();
    super.dispose();
  }

  void _sendRequest() async {
    setState(() {
      _isSubmitting = true;
    });
    await Future<void>.delayed(const Duration(milliseconds: 700));
    if (!mounted) {
      return;
    }
    setState(() {
      _isSubmitting = false;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Devralma talebi gönderildi. Müdür onayı bekleniyor.'),
      ),
    );
    Navigator.pushNamedAndRemoveUntil(
      context,
      AppRoutes.technicianTasks,
      (route) => false,
      arguments: widget.workOrderId,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF6F9FC),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSizes.lg),
          child: Column(
            children: [
              Align(
                alignment: Alignment.topRight,
                child: IconButton(
                  icon: const Icon(Icons.arrow_back),
                  onPressed: () => Navigator.pop(context),
                ),
              ),
              const SizedBox(height: 8),
              const Center(
                child: Text(
                  'Müdür Devralma Talebi',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                    color: AppColors.navy,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                '${widget.sectionName} başlığı için müdür devralma talebi gönder.',
                textAlign: TextAlign.center,
                style: const TextStyle(color: AppColors.grayText),
              ),
              const SizedBox(height: 20),
              _summaryCard(),
              const SizedBox(height: 16),
              TextField(
                controller: _reasonController,
                minLines: 4,
                maxLines: 6,
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'Talep nedeni',
                  hintText:
                      'Lütfen devralma için nedenini kısa ve net yaz.',
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: FilledButton.icon(
                  icon: _isSubmitting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.send),
                  label: Text(_isSubmitting ? 'Gönderiliyor...' : 'Talebi Gönder'),
                  onPressed: _isSubmitting ? null : _sendRequest,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _summaryCard() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.grayBorder),
        boxShadow: const [
          BoxShadow(color: Color(0x11000000), blurRadius: 12, offset: Offset(0, 6)),
        ],
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Başlık', style: TextStyle(fontWeight: FontWeight.w800)),
          const SizedBox(height: 4),
          Text(
            widget.sectionName,
            style: const TextStyle(color: AppColors.darkText),
          ),
          const SizedBox(height: 8),
          Text(
            'Sahiplenen Usta: ${widget.lockedBy}',
            style: const TextStyle(color: AppColors.grayText),
          ),
          const SizedBox(height: 4),
          Text(
            'İş emri: ${widget.workOrderId}',
            style: const TextStyle(color: AppColors.grayText),
          ),
          const SizedBox(height: 4),
          Text(
            'Başlık ID: ${widget.taskId}',
            style: const TextStyle(color: AppColors.grayText),
          ),
        ],
      ),
    );
  }
}
