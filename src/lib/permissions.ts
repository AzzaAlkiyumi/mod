/**
 * Static catalog of every permission a Role can grant. Reverse-engineered
 * from a screen recording of https://hyper-pos.eshopweb.store/admin/roles/create
 * (20 categories, 128 permissions total — matches the reference "Admin"
 * role's permission count exactly).
 *
 * This is domain content (like TaxComponent/DrugSchedule names), not UI
 * chrome, so labels are bilingual right here instead of living in the
 * en.ts/ar.ts dictionaries — those only carry the Roles page's own chrome
 * strings (see Dictionary["roles"]).
 */

export interface PermissionDef {
  key: string;
  labelEn: string;
  labelAr: string;
  dangerous?: boolean;
}

export interface PermissionCategory {
  key: string;
  labelEn: string;
  labelAr: string;
  permissions: PermissionDef[];
}

export const PERMISSION_CATALOG: PermissionCategory[] = [
  {
    key: "accounting",
    labelEn: "Accounting",
    labelAr: "المحاسبة",
    permissions: [
      { key: "accounting.mappings.update", labelEn: "Change business-event → account mappings", labelAr: "تغيير ربط الأحداث التجارية بالحسابات" },
      { key: "accounting.chart.update", labelEn: "Edit the chart of accounts", labelAr: "تعديل دليل الحسابات" },
      { key: "accounting.opening_balances", labelEn: "Enter opening balances", labelAr: "إدخال الأرصدة الافتتاحية", dangerous: true },
      { key: "accounting.lock_period", labelEn: "Lock a fiscal period", labelAr: "قفل فترة مالية" },
      { key: "accounting.manual_entry", labelEn: "Post manual journal entries", labelAr: "ترحيل قيود يومية يدوية" },
      { key: "accounting.reverse_entry", labelEn: "Reverse posted journal entries", labelAr: "عكس قيود يومية مرحّلة" },
      { key: "accounting.year_end_close", labelEn: "Run the year-end close", labelAr: "تنفيذ إقفال نهاية السنة", dangerous: true },
      { key: "accounting.unlock_period", labelEn: "Unlock a locked fiscal period", labelAr: "فتح فترة مالية مقفلة", dangerous: true },
      { key: "accounting.view", labelEn: "View chart of accounts, journal, and financial reports", labelAr: "عرض دليل الحسابات واليومية والتقارير المالية" },
    ],
  },
  {
    key: "backup",
    labelEn: "Backup",
    labelAr: "النسخ الاحتياطي",
    permissions: [
      { key: "backup.restore", labelEn: "Restore from backup", labelAr: "الاستعادة من نسخة احتياطية", dangerous: true },
      { key: "backup.run", labelEn: "Run backups", labelAr: "تشغيل نسخ احتياطي" },
    ],
  },
  {
    key: "customers",
    labelEn: "Customers",
    labelAr: "العملاء",
    permissions: [
      { key: "customers.loyalty_manage", labelEn: "Add or remove loyalty points manually", labelAr: "إضافة أو خصم نقاط الولاء يدويًا" },
      { key: "customers.credit_manage", labelEn: "Add or remove store credit", labelAr: "إضافة أو خصم رصيد المتجر" },
      { key: "customers.create", labelEn: "Create customers", labelAr: "إنشاء عملاء" },
      { key: "customers.delete", labelEn: "Delete customers", labelAr: "حذف عملاء" },
      { key: "customers.export", labelEn: "Export customers", labelAr: "تصدير العملاء" },
      { key: "customers.import", labelEn: "Import customers", labelAr: "استيراد العملاء" },
      { key: "customers.payments_record", labelEn: "Record customer payments (settle outstanding sales)", labelAr: "تسجيل دفعات العملاء (تسوية المبيعات المستحقة)" },
      { key: "customers.update", labelEn: "Update customers", labelAr: "تعديل بيانات العملاء" },
      { key: "customers.view", labelEn: "View customers", labelAr: "عرض العملاء" },
    ],
  },
  {
    key: "expenses",
    labelEn: "Expenses",
    labelAr: "المصروفات",
    permissions: [
      { key: "expenses.delete", labelEn: "Delete expenses", labelAr: "حذف المصروفات" },
      { key: "expenses.update", labelEn: "Edit expenses", labelAr: "تعديل المصروفات" },
      { key: "expenses.export", labelEn: "Export expenses", labelAr: "تصدير المصروفات" },
      { key: "expenses.create", labelEn: "Record expenses", labelAr: "تسجيل مصروفات" },
      { key: "expenses.view", labelEn: "View expenses", labelAr: "عرض المصروفات" },
    ],
  },
  {
    key: "hardware",
    labelEn: "Hardware",
    labelAr: "الأجهزة",
    permissions: [
      { key: "terminals.configure", labelEn: "Create, edit, and configure terminals + hardware", labelAr: "إنشاء وتعديل وضبط الأجهزة الطرفية والمعدات" },
      { key: "hardware.test_print", labelEn: "Trigger test prints", labelAr: "تشغيل طباعة تجريبية" },
      { key: "hardware.diagnostics", labelEn: "View and run the hardware diagnostics page", labelAr: "عرض وتشغيل صفحة تشخيص الأجهزة" },
      { key: "terminals.view", labelEn: "View checkout terminals", labelAr: "عرض أجهزة نقاط البيع" },
    ],
  },
  {
    key: "operations",
    labelEn: "Operations",
    labelAr: "العمليات",
    permissions: [
      { key: "sync.log.retry", labelEn: "Retry or dismiss failed sync entries (replays a stuck sale server-side)", labelAr: "إعادة محاولة أو تجاهل عمليات المزامنة الفاشلة" },
      { key: "sync.log.view", labelEn: "View the sync log (offline-completed sales, failures, conflicts)", labelAr: "عرض سجل المزامنة (مبيعات دون اتصال، أخطاء، تعارضات)" },
    ],
  },
  {
    key: "products",
    labelEn: "Products",
    labelAr: "المنتجات",
    permissions: [
      { key: "products.delete_batch", labelEn: "Archive empty product batches", labelAr: "أرشفة دفعات المنتجات الفارغة" },
      { key: "products.create", labelEn: "Create products", labelAr: "إنشاء منتجات" },
      { key: "products.delete", labelEn: "Delete products", labelAr: "حذف منتجات" },
      { key: "products.export", labelEn: "Export products", labelAr: "تصدير المنتجات" },
      { key: "products.import", labelEn: "Import products", labelAr: "استيراد المنتجات" },
      { key: "taxonomies.manage", labelEn: "Manage categories, brands, and units", labelAr: "إدارة الفئات والعلامات التجارية والوحدات" },
      { key: "products.adjust_stock", labelEn: "Manual stock adjustments", labelAr: "تعديلات المخزون اليدوية" },
      { key: "products.update_cost", labelEn: "See and update cost prices", labelAr: "عرض وتعديل أسعار التكلفة" },
      { key: "inventory.sell_expired", labelEn: "Sell expired batches (overrides the block-expired setting)", labelAr: "بيع دفعات منتهية الصلاحية (تجاوز إعداد المنع)" },
      { key: "products.transfer_stock", labelEn: "Transfer stock between stores", labelAr: "نقل المخزون بين المتاجر" },
      { key: "products.update", labelEn: "Update products", labelAr: "تعديل المنتجات" },
      { key: "products.view", labelEn: "View products", labelAr: "عرض المنتجات" },
    ],
  },
  {
    key: "purchases",
    labelEn: "Purchases",
    labelAr: "المشتريات",
    permissions: [
      { key: "purchases.create", labelEn: "Create purchases", labelAr: "إنشاء طلبات شراء" },
      { key: "purchases.delete", labelEn: "Delete purchases", labelAr: "حذف طلبات الشراء" },
      { key: "purchases.receive", labelEn: "Mark goods received", labelAr: "تأكيد استلام البضاعة" },
      { key: "purchases.update", labelEn: "Update purchases", labelAr: "تعديل طلبات الشراء" },
      { key: "purchases.view", labelEn: "View purchases", labelAr: "عرض طلبات الشراء" },
    ],
  },
  {
    key: "quotations",
    labelEn: "Quotations",
    labelAr: "عروض الأسعار",
    permissions: [
      { key: "quotations.cancel", labelEn: "Cancel quotations", labelAr: "إلغاء عروض الأسعار", dangerous: true },
      { key: "quotations.convert", labelEn: "Convert quotations to sales", labelAr: "تحويل عروض الأسعار إلى مبيعات" },
      { key: "quotations.create", labelEn: "Create quotations", labelAr: "إنشاء عروض أسعار" },
      { key: "quotations.update", labelEn: "Edit draft quotations", labelAr: "تعديل عروض الأسعار المسودة" },
      { key: "quotations.send", labelEn: "Send and revise quotations", labelAr: "إرسال ومراجعة عروض الأسعار" },
      { key: "quotations.view_all", labelEn: "View all quotations in store", labelAr: "عرض جميع عروض الأسعار بالمتجر" },
      { key: "quotations.view_own", labelEn: "View own quotations", labelAr: "عرض عروض الأسعار الخاصة بي" },
    ],
  },
  {
    key: "reports",
    labelEn: "Reports",
    labelAr: "التقارير",
    permissions: [
      { key: "reports.export", labelEn: "Export reports", labelAr: "تصدير التقارير" },
      { key: "reports.cross_store", labelEn: "Run cross-store reports", labelAr: "تشغيل تقارير متعددة المتاجر" },
      { key: "reports.save_shared", labelEn: "Save reports shared with the store", labelAr: "حفظ تقارير مشتركة مع المتجر" },
      { key: "reports.schedule", labelEn: "Schedule recurring report deliveries", labelAr: "جدولة إرسال التقارير الدورية" },
      { key: "reports.view_customers", labelEn: "View customer reports", labelAr: "عرض تقارير العملاء" },
      { key: "reports.view_employees", labelEn: "View employee / cashier reports", labelAr: "عرض تقارير الموظفين / الكاشير" },
      { key: "reports.view_financial", labelEn: "View financial reports", labelAr: "عرض التقارير المالية" },
      { key: "reports.view_inventory", labelEn: "View inventory reports", labelAr: "عرض تقارير المخزون" },
      { key: "reports.view_sales", labelEn: "View sales reports", labelAr: "عرض تقارير المبيعات" },
      { key: "reports.view_suppliers", labelEn: "View supplier reports", labelAr: "عرض تقارير الموردين" },
      { key: "reports.view_tax", labelEn: "View tax reports", labelAr: "عرض تقارير الضرائب" },
    ],
  },
  {
    key: "returns",
    labelEn: "Returns",
    labelAr: "المرتجعات",
    permissions: [
      { key: "returns.create", labelEn: "Process a return", labelAr: "تنفيذ مرتجع" },
      { key: "returns.create_above_threshold", labelEn: "Process returns above thresholds", labelAr: "تنفيذ مرتجعات تتجاوز الحد المسموح" },
      { key: "returns.void", labelEn: "Void a return", labelAr: "إلغاء مرتجع" },
    ],
  },
  {
    key: "sales",
    labelEn: "Sales",
    labelAr: "المبيعات",
    permissions: [
      { key: "sales.discount", labelEn: "Apply discounts", labelAr: "تطبيق خصومات" },
      { key: "sales.discount_above_threshold", labelEn: "Apply discounts above the threshold", labelAr: "تطبيق خصومات تتجاوز الحد المسموح" },
      { key: "sales.create", labelEn: "Create sales", labelAr: "إنشاء عمليات بيع" },
      { key: "sales.update", labelEn: "Edit draft sales", labelAr: "تعديل عمليات البيع المسودة" },
      { key: "sales.held.create", labelEn: "Park a sale", labelAr: "تعليق عملية بيع" },
      { key: "sales.print_receipt", labelEn: "Print or share receipts", labelAr: "طباعة أو مشاركة الإيصالات" },
      { key: "sales.refund", labelEn: "Process a refund", labelAr: "تنفيذ استرداد" },
      { key: "sales.held.resume_others", labelEn: "Resume sales parked by others", labelAr: "استئناف عمليات بيع علّقها آخرون" },
      { key: "sales.adjust_price", labelEn: "Sell at a manually entered price (overrides the catalogue price)", labelAr: "البيع بسعر مُدخل يدويًا (تجاوز سعر الكتالوج)" },
      { key: "sales.oversell", labelEn: "Sell below available stock (overrides the negative-stock block)", labelAr: "البيع رغم نقص المخزون (تجاوز منع المخزون السالب)" },
      { key: "sales.view_all", labelEn: "View all sales in store", labelAr: "عرض جميع المبيعات بالمتجر" },
      { key: "sales.view_own", labelEn: "View own sales", labelAr: "عرض المبيعات الخاصة بي" },
      { key: "sales.cross_store_view", labelEn: "View sales across all stores", labelAr: "عرض المبيعات عبر جميع المتاجر" },
      { key: "sales.void", labelEn: "Void a posted sale", labelAr: "إلغاء عملية بيع مرحّلة" },
    ],
  },
  {
    key: "salesChannels",
    labelEn: "Sales Channels",
    labelAr: "قنوات البيع",
    permissions: [
      { key: "commerce.manage", labelEn: "Configure sales channels and credentials", labelAr: "ضبط قنوات البيع وبيانات الاعتماد", dangerous: true },
      { key: "commerce.sync.retry", labelEn: "Retry failed channel synchronization", labelAr: "إعادة محاولة مزامنة القناة الفاشلة" },
      { key: "commerce.orders.manage", labelEn: "Review and manage imported channel orders", labelAr: "مراجعة وإدارة طلبات القنوات المستوردة" },
      { key: "commerce.view", labelEn: "View sales channel connections and sync health", labelAr: "عرض اتصالات قنوات البيع وحالة المزامنة" },
    ],
  },
  {
    key: "settings",
    labelEn: "Settings",
    labelAr: "الإعدادات",
    permissions: [
      { key: "settings.tax.update", labelEn: "Edit tax components and groups", labelAr: "تعديل مكونات ومجموعات الضريبة" },
      { key: "settings.update_dangerous", labelEn: "Update license, updater, backup destinations, AI keys, Pusher creds", labelAr: "تعديل الترخيص والمحدّث ووجهات النسخ الاحتياطي ومفاتيح AI وبيانات Pusher", dangerous: true },
      { key: "settings.update", labelEn: "Update most settings", labelAr: "تعديل معظم الإعدادات" },
      { key: "settings.view", labelEn: "View settings", labelAr: "عرض الإعدادات" },
      { key: "settings.tax.view", labelEn: "View tax settings (components, groups)", labelAr: "عرض إعدادات الضريبة (المكونات، المجموعات)" },
    ],
  },
  {
    key: "shifts",
    labelEn: "Shifts",
    labelAr: "الورديات",
    permissions: [
      { key: "shifts.close_others", labelEn: "Close other cashiers' shifts", labelAr: "إغلاق ورديات كاشيرين آخرين" },
      { key: "shifts.close_own", labelEn: "Close own shift", labelAr: "إغلاق ورديتي" },
      { key: "shifts.open", labelEn: "Open a shift", labelAr: "فتح وردية" },
      { key: "cash_drawer.open_no_sale", labelEn: "Open cash drawer without a sale", labelAr: "فتح درج النقدية دون عملية بيع" },
      { key: "cash_drawer.pay_in", labelEn: "Record cash pay-in", labelAr: "تسجيل إيداع نقدي" },
      { key: "cash_drawer.pay_out", labelEn: "Record cash pay-out", labelAr: "تسجيل سحب نقدي" },
      { key: "shifts.bypass_enforcement", labelEn: "Sell without an open shift", labelAr: "البيع دون فتح وردية" },
      { key: "shifts.view_all", labelEn: "View other cashiers' shifts", labelAr: "عرض ورديات الكاشيرين الآخرين" },
    ],
  },
  {
    key: "stores",
    labelEn: "Stores",
    labelAr: "المتاجر",
    permissions: [
      { key: "stores.create", labelEn: "Create stores", labelAr: "إنشاء متاجر" },
      { key: "stores.delete", labelEn: "Delete stores", labelAr: "حذف متاجر" },
      { key: "stores.update", labelEn: "Update stores", labelAr: "تعديل المتاجر" },
      { key: "stores.view", labelEn: "View stores", labelAr: "عرض المتاجر" },
    ],
  },
  {
    key: "suppliers",
    labelEn: "Suppliers",
    labelAr: "الموردون",
    permissions: [
      { key: "suppliers.create", labelEn: "Create suppliers", labelAr: "إنشاء موردين" },
      { key: "suppliers.delete", labelEn: "Delete suppliers", labelAr: "حذف موردين" },
      { key: "suppliers.payments_record", labelEn: "Record supplier payments", labelAr: "تسجيل دفعات الموردين" },
      { key: "suppliers.update", labelEn: "Update suppliers", labelAr: "تعديل بيانات الموردين" },
      { key: "suppliers.view", labelEn: "View suppliers", labelAr: "عرض الموردين" },
      { key: "suppliers.payments_void", labelEn: "Void supplier payments", labelAr: "إلغاء دفعات الموردين" },
    ],
  },
  {
    key: "updater",
    labelEn: "Updater",
    labelAr: "التحديثات",
    permissions: [
      { key: "updater.check", labelEn: "Check for updates", labelAr: "التحقق من التحديثات" },
      { key: "updater.run", labelEn: "Run updates", labelAr: "تشغيل التحديثات", dangerous: true },
    ],
  },
  {
    key: "users",
    labelEn: "Users",
    labelAr: "المستخدمون",
    permissions: [
      { key: "users.create_super_admin", labelEn: "Create super-admin users", labelAr: "إنشاء مستخدمين بصلاحية المشرف الأعلى", dangerous: true },
      { key: "users.create", labelEn: "Create users", labelAr: "إنشاء مستخدمين" },
      { key: "users.delete", labelEn: "Delete users", labelAr: "حذف مستخدمين" },
      { key: "users.force_logout", labelEn: "Force a user to log out", labelAr: "إجبار مستخدم على تسجيل الخروج" },
      { key: "roles.manage", labelEn: "Manage roles and permissions", labelAr: "إدارة الأدوار والصلاحيات" },
      { key: "users.mfa_reset", labelEn: "Reset another user's MFA", labelAr: "إعادة ضبط التحقق الثنائي لمستخدم آخر", dangerous: true },
      { key: "users.update", labelEn: "Update users", labelAr: "تعديل بيانات المستخدمين" },
      { key: "users.view", labelEn: "View users", labelAr: "عرض المستخدمين" },
    ],
  },
  {
    key: "whatsapp",
    labelEn: "WhatsApp",
    labelAr: "واتساب",
    permissions: [
      { key: "settings.whatsapp.credentials", labelEn: "Manage WhatsApp credentials", labelAr: "إدارة بيانات اعتماد واتساب", dangerous: true },
      { key: "whatsapp.logs.retry", labelEn: "Retry failed WhatsApp deliveries", labelAr: "إعادة محاولة إرسال رسائل واتساب الفاشلة" },
      { key: "whatsapp.send_bulk", labelEn: "Send bulk WhatsApp messages", labelAr: "إرسال رسائل واتساب جماعية", dangerous: true },
      { key: "whatsapp.send_statement", labelEn: "Send customer statements", labelAr: "إرسال كشوف حساب للعملاء" },
      { key: "whatsapp.send_receipt", labelEn: "Send receipts and quotations", labelAr: "إرسال الإيصالات وعروض الأسعار" },
      { key: "whatsapp.send_supplier_voucher", labelEn: "Send supplier payment vouchers", labelAr: "إرسال سندات دفع الموردين" },
      { key: "settings.whatsapp.update", labelEn: "Update WhatsApp settings and templates", labelAr: "تعديل إعدادات وقوالب واتساب" },
      { key: "whatsapp.logs.view", labelEn: "View WhatsApp delivery logs", labelAr: "عرض سجلات إرسال واتساب" },
    ],
  },
];

export const ALL_PERMISSION_KEYS: string[] = PERMISSION_CATALOG.flatMap((c) =>
  c.permissions.map((p) => p.key),
);

const PERMISSION_KEY_SET = new Set(ALL_PERMISSION_KEYS);

export function isValidPermissionKey(key: string): boolean {
  return PERMISSION_KEY_SET.has(key);
}

export function categoryOf(key: string): PermissionCategory | undefined {
  return PERMISSION_CATALOG.find((c) => c.permissions.some((p) => p.key === key));
}
