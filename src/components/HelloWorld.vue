<template>
  <div class="app-shell" :dir="isEnglish ? 'ltr' : 'rtl'" :lang="isEnglish ? 'en' : 'ar'">
    <div v-if="loading" class="boot-screen">
      <div class="brand-mark">س</div>
      <strong>سومر</strong>
      <span>جاري تجهيز نظام التشغيل...</span>
    </div>

    <section v-else-if="!session" class="auth-screen">
      <div class="auth-art">
        <div class="auth-orbit orbit-one"></div><div class="auth-orbit orbit-two"></div>
        <div class="auth-brand"><div class="brand-mark">س</div><div><b>سومر</b><small>RESTAURANT OPERATIONS</small></div></div>
        <div class="auth-copy">
          <span class="kicker">SMART RESTAURANT SYSTEM</span>
          <h1>كل تفاصيل مطعمك،<br><em>في مكان واحد.</em></h1>
          <p>نظام تشغيل وإدارة الطلبات والمنتجات لمطعم سومر.</p>
          <div class="auth-points"><span>● إدارة المنتجات</span><span>● متابعة الطلبات</span><span>● تقارير التشغيل</span></div>
        </div>
        <div class="auth-art-footer">SOMER · EST. 2026</div>
      </div>
      <div class="auth-panel">
        <div class="auth-panel-inner">
          <span class="kicker gold">مرحباً بعودتك</span>
          <h2>تسجيل الدخول</h2>
          <p class="muted">استخدم حساب الموظف المعتمد للدخول إلى النظام.</p>
          <form @submit.prevent="signIn" class="auth-form">
            <label>البريد الإلكتروني</label>
            <input v-model.trim="login.email" type="email" autocomplete="username" placeholder="name@example.com" required>
            <label>كلمة المرور</label>
            <input v-model="login.password" type="password" autocomplete="current-password" placeholder="••••••••" required>
            <button class="primary-btn wide" :disabled="busy">{{ busy ? 'جاري الدخول...' : 'دخول إلى النظام' }} <span>←</span></button>
          </form>
          <div v-if="error" class="alert error">{{ error }}</div>
          <div class="auth-help">الدخول مخصص للموظفين الذين أضافهم مدير النظام فقط.</div>
        </div>
      </div>
    </section>

    <template v-else>
      <aside class="sidebar" :class="{ 'sidebar-open': mobileNav }">
        <div class="side-brand">
          <div class="brand-mark">س</div>
          <div><b>سومر</b><small>RESTAURANT POS</small></div>
          <button class="mobile-close" @click="mobileNav=false">×</button>
        </div>
        <div class="side-caption">{{ isEnglish ? "Workspace" : "مساحة التشغيل" }}</div>
        <button v-if="['owner_admin','manager','cashier'].includes(profile.role)" class="side-link" :class="{active:page==='cashier'}" @click="go('cashier')"><span>▦</span> {{ isEnglish ? "Cashier" : "الكاشير" }}</button>
        <button class="side-link" :class="{active:page==='orders'}" @click="go('orders')"><span>▤</span> {{ isEnglish ? "Orders" : "الطلبات" }} <i v-if="orders.length">{{ orders.length }}</i></button>
        <button class="side-link" :class="{active:page==='shifts'}" @click="go('shifts')"><span>◷</span> {{ isEnglish ? "My Shift" : "الشيفت والحساب" }}</button>
        <template v-if="isAdmin">
          <div class="side-caption side-gap">{{ isEnglish ? "Management" : "الإدارة" }}</div>
          <button class="side-link" :class="{active:page==='dashboard'}" @click="go('dashboard')"><span>◫</span> {{ isEnglish ? "Dashboard" : "لوحة التحكم" }}</button>
          <button class="side-link" :class="{active:page==='products'}" @click="go('products')"><span>◈</span> {{ isEnglish ? "Products & Menu" : "المنتجات والمنيو" }}</button>
          <button class="side-link" :class="{active:page==='inventory'}" @click="go('inventory')"><span>▥</span> {{ isEnglish ? "Inventory" : "المخزون" }}</button>
          <button class="side-link" :class="{active:page==='staff'}" @click="go('staff')"><span>♙</span> {{ isEnglish ? "Staff" : "الموظفون" }}</button>
          <button class="side-link" :class="{active:page==='printers'}" @click="go('printers')"><span>▤</span> {{ isEnglish ? "Printers" : "الطابعات والطباعة" }}</button>
        </template>
        <div class="side-bottom">
          <div class="connection"><i></i><span>{{ isEnglish ? "Database connected" : "متصل بقاعدة البيانات" }}</span></div>
          <div class="profile">
            <div class="profile-avatar">{{ (profile.display_name || session.user.email || 'م').slice(0,1) }}</div>
            <div class="profile-text"><b>{{ profile.display_name || session.user.email }}</b><small>{{ roleLabel }}</small></div>
            <button class="logout" @click="signOut" title="تسجيل الخروج">↗</button>
          </div>
        </div>
      </aside>

      <main class="main-area">
        <header class="topbar">
          <button class="mobile-menu" @click="mobileNav=true">☰</button>
          <div><div class="breadcrumb">{{ isEnglish ? "Somer" : "سومر" }} <span>/</span> {{ pageTitle }}</div><h1>{{ pageTitle }}</h1></div>
          <div class="topbar-right">
            <button class="language-toggle" @click="toggleLanguage" :aria-label="isEnglish ? 'Switch to Arabic' : 'Switch to English'">{{ isEnglish ? 'العربية' : 'English' }}</button>
            <div class="live-time"><b>{{ clock }}</b><small>{{ dateLabel }}</small></div>
            <div class="top-avatar">{{ (profile.display_name || 'م').slice(0,1) }}</div>
          </div>
        </header>

        <div v-if="notice.text" class="notice" :class="notice.type">{{ notice.text }}<button @click="notice.text=''">×</button></div>

        <!-- CASHIER -->
        <section v-if="page==='cashier'" class="page-content">
          <div class="welcome-banner">
            <div class="welcome-text"><span class="kicker">SOMER · POINT OF SALE</span><h2>الطعم يبدأ من هنا<span>.</span></h2><p>اختار الطلب، أضف الأصناف، وأكّد العملية في ثوانٍ.</p></div>
            <div class="banner-decoration"><div class="plate-ring"></div><div class="banner-letter">س</div></div>
            <div class="banner-tag">نظام سومر الذكي <b>01 / POS</b></div>
          </div>

          <div class="mode-strip">
            <div><b>نوع الطلب</b><small>حدد طريقة تقديم الطلب</small></div>
            <div class="mode-switch">
              <button :class="{chosen:orderType==='dine_in'}" @click="orderType='dine_in'">♨ الصالة</button>
              <button :class="{chosen:orderType==='delivery'}" @click="orderType='delivery'">⌁ الدليفري</button>
            </div>
            <div class="order-sequence"><small>الطلب الجديد</small><b># تلقائي من النظام</b></div>
          </div>

          <div class="cashier-layout">
            <section class="menu-panel">
              <div class="section-heading"><div><span class="kicker gold">THE MENU</span><h2>قائمة الطعام</h2><p>اختر صنفاً لإضافته إلى الطلب.</p></div><span class="item-counter">{{ filteredProducts.length }} صنف</span></div>
              <div class="searchbar"><span>⌕</span><input v-model="search" placeholder="ابحث باسم المنتج..."><button v-if="search" @click="search=''">مسح</button></div>
              <div class="category-row">
                <button v-for="cat in categories" :key="cat.id" :class="{selected:activeCategory===cat.id}" @click="activeCategory=cat.id">{{ cat.name }}</button>
              </div>
              <div v-if="productsLoading" class="empty-state">جاري تحميل المنيو...</div>
              <div v-else-if="!filteredProducts.length" class="empty-state"><div class="empty-icon">◇</div><b>لا توجد منتجات حالياً</b><p>يمكن للمدير إضافة المنتجات والصور من زر الإدارة.</p><button v-if="isAdmin" class="outline-btn" @click="go('products')">إضافة منتج</button></div>
              <div v-else class="product-grid">
                <button v-for="p in filteredProducts" :key="p.id" class="product-card" @click="addToCart(p)">
                  <div class="product-photo">
                    <img v-if="p.imageUrl" :src="p.imageUrl" :alt="p.name">
                    <div v-else class="photo-placeholder"><span>س</span><small>SOMER</small></div>
                    <span class="photo-add">+</span>
                  </div>
                  <div class="product-card-body"><b>{{ p.name }}</b><p>{{ p.description || 'صنف من قائمة سومر' }}</p><div class="product-card-foot"><strong>{{ money(p.price) }} <small>جنيه</small></strong><span>إضافة +</span></div></div>
                </button>
              </div>
            </section>

            <aside class="cart-panel">
              <div class="cart-head"><div><span class="kicker gold">CURRENT ORDER</span><h3>تفاصيل الطلب</h3></div><span class="cart-count">{{ cartCount }}</span></div>
              <div class="cart-mode"><span>{{ orderType==='delivery'?'⌁':'♨' }}</span>{{ orderType==='delivery'?'طلب دليفري':'طلب صالة' }}<small>طلب جديد</small></div>
              <div class="cart-items">
                <div v-for="item in cart" :key="item.id" class="cart-row">
                  <div class="cart-thumb"><img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name"><span v-else>س</span></div>
                  <div class="cart-row-info"><b>{{ item.name }}</b><small>{{ money(item.price) }} ج</small><div class="qty-control"><button @click="changeQty(item.id,-1)">−</button><b>{{ item.quantity }}</b><button @click="changeQty(item.id,1)">+</button></div></div>
                  <div class="cart-row-total"><b>{{ money(item.price*item.quantity) }}</b><button @click="removeFromCart(item.id)">×</button></div>
                </div>
                <div v-if="!cart.length" class="cart-empty"><div>＋</div><b>الطلب فارغ</b><p>اختار أصنافك من قائمة الطعام.</p></div>
              </div>
              <div class="cart-fields">
                <div v-if="orderType==='delivery'" class="field"><label>عنوان التوصيل *</label><input v-model="deliveryAddress" placeholder="اكتب عنوان العميل"></div>
                <div class="field"><label>اسم العميل (اختياري)</label><input v-model="customerName" placeholder="اسم العميل"></div>
                <div class="field"><label>رقم الهاتف (اختياري)</label><input v-model="customerPhone" inputmode="tel" placeholder="01xxxxxxxxx"></div>
                <div class="field"><label>الخصم بالجنيه</label><input v-model.number="discount" type="number" min="0" :max="subtotal" placeholder="0"></div>
                <div class="field"><label>طريقة الدفع</label><select v-model="paymentMethod"><option value="cash">نقدي</option><option value="card">بطاقة</option><option value="wallet">محفظة</option><option value="online">أونلاين</option><option value="other">أخرى</option></select></div>
              </div>
              <div class="cart-summary">
                <div><span>المجموع الفرعي</span><b>{{ money(subtotal) }} ج</b></div>
                <div><span>رسوم التوصيل</span><b>{{ money(deliveryFee) }} ج</b></div>
                <div class="discount-line"><span>الخصم</span><b>− {{ money(appliedDiscount) }} ج</b></div>
                <div class="total-line"><span>الإجمالي</span><strong>{{ money(total) }} <small>جنيه</small></strong></div>
                <button class="primary-btn wide confirm-btn" :disabled="!cart.length || busy || (orderType==='delivery'&&!deliveryAddress.trim())" @click="submitOrder">{{ busy?'جاري حفظ الطلب...':'تأكيد وحفظ الطلب' }} <span>←</span></button>
                <button class="text-btn wide" :disabled="!cart.length" @click="clearCart">إلغاء الطلب الحالي</button>
              </div>
            </aside>
          </div>
        </section>

        <!-- ADMIN DASHBOARD -->
        <section v-if="page==='dashboard' && isAdmin" class="page-content">
          <div class="page-intro"><div><span class="kicker gold">MANAGEMENT OVERVIEW</span><h2>نظرة عامة على المطعم</h2><p>ملخص سريع لحركة التشغيل والطلبات.</p></div><button class="outline-btn" @click="loadAdminData">↻ تحديث البيانات</button></div>
          <div class="stats-grid">
            <div class="stat-card"><span>طلبات اليوم</span><b>{{ todayOrders.length }}</b><small>عدد الطلبات المسجلة اليوم</small><i>▤</i></div>
            <div class="stat-card"><span>مبيعات اليوم</span><b>{{ money(todayRevenue) }} <small>ج</small></b><small>إجمالي الطلبات المؤكدة</small><i>◈</i></div>
            <div class="stat-card"><span>أصناف المنيو</span><b>{{ products.length }}</b><small>الأصناف النشطة</small><i>▦</i></div>
            <div class="stat-card"><span>الموظفون</span><b>{{ staff.length }}</b><small>حسابات الموظفين</small><i>♙</i></div>
          </div>
          <div class="admin-grid">
            <div class="surface-card"><div class="surface-title"><div><h3>أحدث الطلبات</h3><p>آخر العمليات المسجلة</p></div><button class="link-btn" @click="go('orders')">كل الطلبات ←</button></div>
              <div v-if="!orders.length" class="empty-state compact">لا توجد طلبات حتى الآن.</div>
              <div v-for="o in orders.slice(0,6)" :key="o.id" class="order-mini"><div><b>#{{ o.order_number }}</b><small>{{ formatDate(o.created_at) }} · {{ o.order_type==='delivery'?'دليفري':'صالة' }}</small></div><strong>{{ money(o.total) }} ج</strong><span class="status-pill" :class="o.status">{{ statusLabel(o.status) }}</span></div>
            </div>
            <div class="surface-card quick-actions"><div class="surface-title"><div><h3>إجراءات سريعة</h3><p>إدارة النظام من مكان واحد</p></div></div>
              <button @click="openNewProduct"><span>＋</span><div><b>إضافة منتج جديد</b><small>اسم، وصف، صورة وسعر</small></div><i>←</i></button>
              <button @click="go('orders')"><span>▤</span><div><b>متابعة الطلبات</b><small>عرض وتحديث حالة الطلب</small></div><i>←</i></button>
              <button @click="go('staff')"><span>♙</span><div><b>إدارة الموظفين</b><small>عرض حسابات فريق العمل</small></div><i>←</i></button>
            </div>
          </div>
        </section>

        <!-- PRODUCTS ADMIN -->
        <section v-if="page==='products' && isAdmin" class="page-content">
          <div class="page-intro"><div><span class="kicker gold">MENU MANAGEMENT</span><h2>المنتجات والمنيو</h2><p>أضف أصناف المطعم وصورها وأسعارها، وستظهر للكاشير تلقائياً.</p></div><button class="primary-btn" @click="openNewProduct">＋ إضافة منتج</button></div>
          <div class="surface-card">
            <div class="toolbar"><div class="searchbar admin-search"><span>⌕</span><input v-model="adminSearch" placeholder="ابحث في المنتجات..."></div><span class="muted">{{ adminFilteredProducts.length }} منتج</span></div>
            <div class="admin-product-list">
              <div v-for="p in adminFilteredProducts" :key="p.id" class="admin-product-row">
                <div class="admin-product-image"><img v-if="p.imageUrl" :src="p.imageUrl" :alt="p.name"><span v-else>س</span></div>
                <div class="admin-product-main"><b>{{ p.name }}</b><small>{{ p.description || 'بدون وصف' }}</small><span>{{ categoryName(p.category_id) }} · {{ routeLabel(p.printer_route) }}</span></div>
                <strong class="admin-price">{{ money(p.price) }} ج</strong>
                <span class="active-label" :class="{inactive:!p.is_active}">{{ p.is_active?'نشط':'مخفي' }}</span>
                <button class="icon-btn" @click="editProduct(p)" title="تعديل">✎</button>
                <button class="icon-btn danger" @click="toggleProduct(p)" :title="p.is_active?'إخفاء':'تفعيل'">{{ p.is_active?'◌':'✓' }}</button>
              </div>
              <div v-if="!adminFilteredProducts.length" class="empty-state">لا توجد منتجات. ابدأ بإضافة أول صنف.</div>
            </div>
          </div>
        </section>

        <!-- ORDERS -->
        <section v-if="page==='orders'" class="page-content">
          <div class="page-intro"><div><span class="kicker gold">ORDER MANAGEMENT</span><h2>متابعة الطلبات</h2><p>الطلبات المحفوظة في قاعدة بيانات سومر.</p></div><button class="outline-btn" @click="loadOrders">↻ تحديث</button></div>
          <div class="surface-card">
            <div class="toolbar"><div class="filter-tabs"><button :class="{active:orderFilter==='all'}" @click="orderFilter='all'">الكل</button><button :class="{active:orderFilter==='confirmed'}" @click="orderFilter='confirmed'">مؤكد</button><button :class="{active:orderFilter==='preparing'}" @click="orderFilter='preparing'">قيد التحضير</button><button :class="{active:orderFilter==='ready'}" @click="orderFilter='ready'">جاهز</button><button :class="{active:orderFilter==='completed'}" @click="orderFilter='completed'">مكتمل</button></div></div>
            <div v-for="o in filteredOrders" :key="o.id" class="order-admin-row">
              <div class="order-admin-id"><b>#{{ o.order_number }}</b><small>{{ formatDate(o.created_at) }}</small></div>
              <div class="order-admin-type"><b>{{ o.order_type==='delivery'?'دليفري':'صالة' }}</b><small>{{ o.customer_name || 'عميل مباشر' }}</small></div>
              <div class="order-admin-address">{{ o.order_type==='delivery'?(o.delivery_address||'—'):'طلب صالة' }}</div>
              <strong>{{ money(o.total) }} ج</strong>
              <span class="status-pill" :class="o.status">{{ statusLabel(o.status) }}</span>
              <select v-if="isAdmin" :value="o.status" @change="updateOrderStatus(o,$event.target.value)" class="status-select"><option value="confirmed">مؤكد</option><option value="preparing">قيد التحضير</option><option value="ready">جاهز</option><option value="out_for_delivery">خرج للتوصيل</option><option value="completed">مكتمل</option><option value="cancelled">ملغي</option></select>
            </div>
            <div v-if="!filteredOrders.length" class="empty-state">لا توجد طلبات في هذا التصنيف.</div>
          </div>
        </section>

        <!-- INVENTORY -->
        <section v-if="page==='shifts'" class="page-content">
          <div class="page-intro"><div><span class="kicker gold">SHIFT CONTROL</span><h2>الشيفت والحساب</h2><p>افتح شيفتك وسجل العهدة، ثم اقفلها بمراجعة النقدية.</p></div><button class="outline-btn" @click="loadShiftData">↻ تحديث</button></div>
          <div class="surface-card">
            <div v-if="openShift" class="shift-summary">
              <h3>شيفت مفتوح</h3><p>بدأ في: {{ formatDate(openShift.opened_at) }} · العهدة: {{ money(openShift.opening_cash) }} جنيه</p>
              <div class="form-grid"><div class="field"><label>النقدية الموجودة فعليًا عند الإقفال</label><input v-model.number="shiftClosingCash" type="number" min="0" step="0.01"></div><div class="field"><label>ملاحظة الإقفال</label><input v-model="shiftNote" placeholder="ملاحظات اختيارية"></div></div>
              <button class="primary-btn" :disabled="busy" @click="closeShift">إقفال الشيفت وطباعة التسوية</button>
            </div>
            <div v-else class="shift-summary"><h3>لا يوجد شيفت مفتوح</h3><p>ابدأ الشيفت بتسجيل مبلغ العهدة الموجود في الدرج.</p>
              <div class="form-grid"><div class="field"><label>عهدة بداية الشيفت بالجنيه</label><input v-model.number="shiftOpeningCash" type="number" min="0" step="0.01"></div><div class="field"><label>ملاحظة بداية الشيفت</label><input v-model="shiftNote" placeholder="اختياري"></div></div>
              <button class="primary-btn" :disabled="busy" @click="openShift">فتح الشيفت</button>
            </div>
            <div v-if="lastShiftReport" class="info-note">تسوية آخر شيفت: المتوقع {{ money(lastShiftReport.cash_expected) }} ج · المعدود {{ money(lastShiftReport.cash_counted) }} ج · الفرق {{ money(lastShiftReport.difference) }} ج <button class="outline-btn" @click="printShiftReport">طباعة التقرير</button></div>
          </div>
          <div class="surface-card" style="margin-top:14px"><h3>سجل الشيفتات</h3><div v-for="s in shiftHistory" :key="s.id" class="staff-row"><div class="staff-info"><b>{{ s.status==='open'?'مفتوح':'مغلق' }} · {{ formatDate(s.opened_at) }}</b><small>عهدة البداية {{ money(s.opening_cash) }} ج · {{ s.closed_at ? formatDate(s.closed_at) : 'لم يغلق بعد' }}</small></div><strong>{{ s.closing_cash_counted===null?'—':money(s.closing_cash_counted)+' ج' }}</strong></div><div v-if="!shiftHistory.length" class="empty-state">لا توجد شيفتات مسجلة.</div></div>
        </section>

        <section v-if="page==='printers' && isAdmin" class="page-content">
          <div class="page-intro"><div><span class="kicker gold">PRINT STATIONS</span><h2>الطابعات والطباعة</h2><p>حدد اسم الطابعة ومسار الأصناف وعدد النسخ. الطباعة من المتصفح تحتاج تأكيد نافذة الطباعة.</p></div><button class="outline-btn" @click="loadPrintData">↻ تحديث</button></div>
          <div class="surface-card">
            <div v-for="printer in printerSettings" :key="printer.route" class="printer-setting-row">
              <div class="staff-info"><b>{{ printer.display_name }}</b><small>مسار: {{ routeLabel(printer.route) }}</small></div>
              <input v-model="printer.device_name" placeholder="اسم الطابعة على الكمبيوتر">
              <select v-model="printer.connection_type"><option value="browser">طباعة المتصفح</option><option value="network">شبكة IP</option><option value="usb">USB عبر برنامج وسيط</option></select>
              <input v-if="printer.connection_type==='network'" v-model="printer.ip_address" placeholder="عنوان IP">
              <input v-model.number="printer.copies" type="number" min="1" max="4" aria-label="عدد النسخ">
              <label><input v-model="printer.is_active" type="checkbox"> مفعلة</label>
              <button class="outline-btn" @click="savePrinter(printer)">حفظ</button>
            </div>
          </div>
          <div class="surface-card" style="margin-top:14px"><div class="surface-title"><div><h3>مهام الطباعة المعلقة</h3><p>كل مسار صنف ينشئ مهمة طباعة عند حفظ الطلب.</p></div><button class="outline-btn" @click="loadPrintData">تحديث المهام</button></div>
            <div v-for="job in printJobs" :key="job.id" class="staff-row"><div class="staff-info"><b>طلب #{{ job.order_id }} · {{ routeLabel(job.printer_route) }}</b><small>{{ job.status }} · {{ formatDate(job.queued_at) }} · {{ job.attempts }} محاولات</small></div><button class="primary-btn" @click="printJob(job)">طباعة الآن</button><button class="icon-btn danger" @click="setPrintStatus(job,'cancelled')">×</button></div>
            <div v-if="!printJobs.length" class="empty-state">لا توجد مهام طباعة معلقة.</div>
          </div>
          <div class="info-note">مهم: تم تجهيز طابور الطباعة داخل النظام. الطباعة التلقائية الصامتة بمجرد وصول الطلب تتطلب تثبيت برنامج وسيط صغير على كمبيوتر الكاشير، لأن المتصفح لا يسمح للموقع بالتحكم المباشر في طابعة USB أو طباعة صامتة دون إذن. لن نطلب منك بيانات باركود؛ نحتاج موديل الطابعة وطريقة توصيلها عند إعداد الوسيط.</div>
        </section>

        <section v-if="page==='inventory' && isAdmin" class="page-content">
          <div class="page-intro"><div><span class="kicker gold">STOCK CONTROL</span><h2>المخزون</h2><p>المواد الأساسية المسجلة في قاعدة البيانات.</p></div><button class="outline-btn" @click="loadInventory">↻ تحديث</button></div>
          <div class="inventory-grid">
            <div v-for="item in inventory" :key="item.id" class="inventory-card"><div class="inventory-symbol">{{ item.item_type==='meat'?'◆':'▰' }}</div><div><b>{{ item.display_name }}</b><small>{{ item.item_type==='meat'?'لحوم':'خبز' }}</small></div><strong>{{ money(item.current_quantity) }} <small>{{ item.unit }}</small></strong></div>
            <div v-if="!inventory.length" class="empty-state full">لا توجد مواد مخزون مضافة بعد. يمكنك تجهيز الأصناف الأساسية من قاعدة البيانات أو لاحقاً من شاشة إدارة المخزون.</div>
          </div>
          <div class="info-note">تنبيه: خصم المخزون التلقائي غير مفعل في هذه النسخة؛ لم يتم تحديد توقيت الخصم بعد، لذلك لن نخصم كميات بشكل تلقائي أو غير مؤكد.</div>
        </section>

        <!-- STAFF -->
        <section v-if="page==='staff' && isAdmin" class="page-content">
          <div class="page-intro"><div><span class="kicker gold">TEAM ACCESS</span><h2>{{ isEnglish ? 'Staff & Permissions' : 'الموظفون والصلاحيات' }}</h2><p>{{ isEnglish ? 'Manage employee accounts and roles.' : 'عرض الحسابات المرتبطة بملفات الموظفين.' }}</p></div><button class="primary-btn" @click="openStaffModal">＋ {{ isEnglish ? 'Add employee' : 'إضافة موظف' }}</button></div>
          <div class="surface-card">
            <div v-for="person in staff" :key="person.id" class="staff-row"><div class="profile-avatar">{{ (person.display_name||'م').slice(0,1) }}</div><div class="staff-info"><b>{{ person.display_name || 'موظف' }}</b><small>{{ person.id }}</small></div><span class="role-pill">{{ roleName(person.role) }}</span><span class="active-label" :class="{inactive:!person.is_active}">{{ person.is_active?'نشط':'موقوف' }}</span><select :value="person.role" @change="updateStaff(person,{role:$event.target.value})"><option value="manager">مدير</option><option value="cashier">كاشير</option><option value="kitchen">مطبخ</option><option value="delivery">دليفري</option></select><button class="outline-btn" @click="updateStaff(person,{is_active:!person.is_active})">{{ person.is_active?'إيقاف':'تفعيل' }}</button></div>
            <div v-if="!staff.length" class="empty-state">{{ isEnglish ? 'No employee accounts linked yet.' : 'لا توجد حسابات موظفين مرتبطة حتى الآن.' }}</div>
          </div>
          <div class="info-note">{{ isEnglish ? 'Only authorized administrators can create employee accounts. Each employee receives a role and an active profile.' : 'إنشاء حساب الموظف وتحديد دوره يتم من هنا للمديرين المعتمدين فقط، ولا يوجد تسجيل عام مفتوح.' }}</div>
        </section>
      </main>
    </template>

    <!-- STAFF CREATION -->
    <div v-if="staffModal" class="modal-backdrop" @click.self="staffModal=false">
      <form class="product-modal staff-modal" @submit.prevent="createStaff">
        <div class="modal-head"><div><span class="kicker gold">TEAM ACCESS</span><h2>{{ isEnglish ? 'Add employee account' : 'إضافة حساب موظف' }}</h2></div><button type="button" class="modal-close" @click="staffModal=false">×</button></div>
        <div class="form-grid">
          <div class="field full"><label>{{ isEnglish ? 'Full name *' : 'اسم الموظف *' }}</label><input v-model.trim="staffForm.display_name" required></div>
          <div class="field full"><label>{{ isEnglish ? 'Email *' : 'البريد الإلكتروني *' }}</label><input v-model.trim="staffForm.email" type="email" required autocomplete="off"></div>
          <div class="field full"><label>{{ isEnglish ? 'Temporary password (8+ characters) *' : 'كلمة مرور مؤقتة (8 أحرف على الأقل) *' }}</label><input v-model="staffForm.password" type="password" minlength="8" required autocomplete="new-password"></div>
          <div class="field full"><label>{{ isEnglish ? 'Role *' : 'الدور الوظيفي *' }}</label><select v-model="staffForm.role"><option value="cashier">{{ isEnglish ? 'Cashier' : 'كاشير' }}</option><option value="kitchen">{{ isEnglish ? 'Kitchen' : 'مطبخ' }}</option><option value="delivery">{{ isEnglish ? 'Delivery' : 'دليفري' }}</option><option value="manager">{{ isEnglish ? 'Manager' : 'مدير' }}</option></select></div>
        </div>
        <div class="modal-actions"><button type="button" class="outline-btn" @click="staffModal=false">{{ isEnglish ? 'Cancel' : 'إلغاء' }}</button><button class="primary-btn" :disabled="busy">{{ busy ? (isEnglish ? 'Creating...' : 'جاري إنشاء الحساب...') : (isEnglish ? 'Create employee' : 'إنشاء حساب الموظف') }}</button></div>
        <p v-if="staffError" class="modal-error">{{ staffError }}</p>
      </form>
    </div>

    <!-- PRODUCT EDITOR -->
    <div v-if="productModal" class="modal-backdrop" @click.self="closeProductModal">
      <form class="product-modal" @submit.prevent="saveProduct">
        <div class="modal-head"><div><span class="kicker gold">{{ editingProduct?'EDIT PRODUCT':'NEW PRODUCT' }}</span><h2>{{ editingProduct?'تعديل المنتج':'إضافة منتج جديد' }}</h2></div><button type="button" class="modal-close" @click="closeProductModal">×</button></div>
        <div class="image-upload" @click="$refs.imageInput.click()">
          <img v-if="imagePreview" :src="imagePreview" alt="معاينة صورة المنتج">
          <div v-else class="upload-placeholder"><span>⇧</span><b>اضغط لرفع صورة المنتج</b><small>JPG أو PNG أو WEBP · حتى 5MB</small></div>
          <input ref="imageInput" type="file" accept="image/jpeg,image/png,image/webp" hidden @change="selectImage">
          <button v-if="imagePreview" type="button" class="remove-image" @click.stop="removeSelectedImage">إزالة الصورة</button>
        </div>
        <div class="form-grid">
          <div class="field full"><label>اسم المنتج *</label><input v-model.trim="productForm.name" required placeholder="مثال: برجر كلاسيك"></div>
          <div class="field full"><label>الوصف والمكونات</label><textarea v-model.trim="productForm.description" rows="2" placeholder="اكتب وصف المنتج ومكوناته..."></textarea></div>
          <div class="field"><label>السعر بالجنيه *</label><input v-model.number="productForm.price" type="number" min="0" step="0.01" required></div>
          <div class="field"><label>القسم *</label><select v-model="productForm.category_id" required><option value="" disabled>اختر القسم</option><option v-for="c in categories.filter(x=>x.id!=='all')" :key="c.id" :value="c.id">{{ c.name }}</option></select></div>
          <div class="field"><label>مسار الطباعة</label><select v-model="productForm.printer_route"><option value="main">الطابعة الرئيسية</option><option value="shawarma">طابعة الشاورما</option><option value="burger">طابعة البرجر</option></select></div>
          <div class="field"><label>حالة المنتج</label><select v-model="productForm.is_active"><option :value="true">ظاهر في المنيو</option><option :value="false">مخفي</option></select></div>
        </div>
        <div class="modal-actions"><button type="button" class="outline-btn" @click="closeProductModal">إلغاء</button><button class="primary-btn" :disabled="busy">{{ busy?'جاري الحفظ...':'حفظ المنتج' }}</button></div>
        <p v-if="modalError" class="modal-error">{{ modalError }}</p>
      </form>
    </div>
  </div>
</template>

<script>
import { supabase, PRODUCT_BUCKET } from '../supabase'

export default {
  name: 'HelloWorld',
  data () {
    return {
      loading: true, busy: false, productsLoading: false, session: null, profile: {},
      isEnglish: localStorage.getItem("somer-pos-language") === "en",
      staffModal: false, staffError: "", openShift: null, shiftHistory: [], shiftOpeningCash: 0, shiftClosingCash: 0, shiftNote: "", lastShiftReport: null, printerSettings: [], printJobs: [], staffForm: { display_name: "", email: "", password: "", role: "cashier" },
      page: 'cashier', mobileNav: false, login: { email: '', password: '' },
      error: '', notice: { text: '', type: 'success' }, clock: '', dateLabel: '',
      clockTimer: null, authSubscription: null,
      categories: [{ id: 'all', name: 'كل الأصناف' }], products: [], orders: [], staff: [], inventory: [],
      cart: [], search: '', adminSearch: '', activeCategory: 'all', orderType: 'dine_in',
      deliveryAddress: '', customerName: '', customerPhone: '', discount: 0, paymentMethod: 'cash',
      orderFilter: 'all', productModal: false, editingProduct: null, selectedImage: null,
      imagePreview: '', removeImage: false, modalError: '',
      productForm: { name: '', description: '', price: 0, category_id: '', printer_route: 'main', is_active: true }
    }
  },
  computed: {
    isAdmin () { return ['owner_admin', 'manager'].includes(this.profile.role) },
    canSell () { return ['owner_admin','manager','cashier'].includes(this.profile.role) },
    roleLabel () { return this.roleName(this.profile.role) },
    pageTitle () {
      return this.isEnglish ? ({ cashier: 'Point of Sale', dashboard: 'Dashboard', products: 'Products & Menu', orders: 'Orders', inventory: 'Inventory', staff: 'Staff', shifts: 'My Shift', printers: 'Printers' })[this.page] || 'Somer' : ({ cashier: 'نقطة البيع', dashboard: 'لوحة التحكم', products: 'المنتجات والمنيو', orders: 'الطلبات', inventory: 'المخزون', staff: 'الموظفون', shifts: 'الشيفت والحساب', printers: 'الطابعات والطباعة' })[this.page] || 'سومر'
    },
    filteredProducts () {
      const q = this.search.trim().toLocaleLowerCase()
      return this.products.filter(p => p.is_active && (this.activeCategory === 'all' || p.category_id === this.activeCategory) && (!q || p.name.toLocaleLowerCase().includes(q) || (p.description || '').toLocaleLowerCase().includes(q)))
    },
    adminFilteredProducts () {
      const q = this.adminSearch.trim().toLocaleLowerCase()
      return this.products.filter(p => !q || p.name.toLocaleLowerCase().includes(q))
    },
    cartCount () { return this.cart.reduce((n, item) => n + item.quantity, 0) },
    subtotal () { return this.cart.reduce((n, item) => n + Number(item.price) * item.quantity, 0) },
    appliedDiscount () { return Math.min(Math.max(Number(this.discount) || 0, 0), this.subtotal) },
    deliveryFee () { return this.orderType === 'delivery' && this.cart.length ? 20 : 0 },
    total () { return Math.max(0, this.subtotal - this.appliedDiscount + this.deliveryFee) },
    todayOrders () {
      const today = new Date().toDateString()
      return this.orders.filter(o => new Date(o.created_at).toDateString() === today)
    },
    todayRevenue () { return this.todayOrders.filter(o => o.status !== 'cancelled').reduce((n, o) => n + Number(o.total || 0), 0) },
    filteredOrders () { return this.orderFilter === 'all' ? this.orders : this.orders.filter(o => o.status === this.orderFilter) }
  },
  async mounted () {
    this.updateClock()
    this.clockTimer = setInterval(this.updateClock, 30000)
    const { data } = await supabase.auth.getSession()
    this.session = data.session
    if (this.session) await this.loadProfileAndStart()
    this.loading = false
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      this.session = session
      if (session) {
        await this.loadProfileAndStart()
      } else {
        this.profile = {}; this.products = []; this.orders = []; this.cart = []; this.page = 'cashier'
      }
    })
    this.authSubscription = listener.subscription
  },
  beforeUnmount () {
    clearInterval(this.clockTimer)
    if (this.authSubscription) this.authSubscription.unsubscribe()
  },
  methods: {
    money (value) { return Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 2 }) },
    updateClock () {
      const d = new Date()
      this.clock = d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      this.dateLabel = d.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })
    },
    notify (text, type = 'success') {
      this.notice = { text, type }
      window.clearTimeout(this.noticeTimer)
      this.noticeTimer = window.setTimeout(() => { this.notice.text = '' }, 4200)
    },
    toggleLanguage () {
      this.isEnglish = !this.isEnglish
      localStorage.setItem("somer-pos-language", this.isEnglish ? "en" : "ar")
      document.documentElement.lang = this.isEnglish ? "en" : "ar"
      document.documentElement.dir = this.isEnglish ? "ltr" : "rtl"
    },
    openStaffModal () { this.staffError = ""; this.staffForm = { display_name: "", email: "", password: "", role: "cashier" }; this.staffModal = true },
    async createStaff () {
      if (!this.isAdmin) return
      this.busy = true; this.staffError = ""
      try {
        const { data, error } = await supabase.functions.invoke("create-staff-user", { body: this.staffForm })
        if (error) throw error
        if (data?.error) throw new Error(data.error)
        this.staffModal = false
        this.staffForm = { display_name: "", email: "", password: "", role: "cashier" }
        this.notify(this.isEnglish ? "Employee account created successfully." : "تم إنشاء حساب الموظف بنجاح.")
        await this.loadStaff()
      } catch (e) { this.staffError = e.message || (this.isEnglish ? "Could not create employee." : "تعذر إنشاء حساب الموظف.") }
      finally { this.busy = false }
    },
    async signIn () {
      this.busy = true; this.error = ''
      const { error } = await supabase.auth.signInWithPassword({ email: this.login.email, password: this.login.password })
      if (error) this.error = 'تعذر تسجيل الدخول: ' + error.message
      this.busy = false
    },
    async signOut () { await supabase.auth.signOut() },
    async loadProfileAndStart () {
      const { data, error } = await supabase.from('staff_profiles').select('*').eq('id', this.session.user.id).maybeSingle()
      if (error || !data || !data.is_active) {
        this.profile = {}
        await supabase.auth.signOut()
        this.error = 'الحساب غير مربوط بملف موظف نشط. اطلب من مدير النظام تفعيل حسابك.'
        return
      }
      this.profile = data
      await Promise.all([this.loadCategories(), this.loadProducts(), this.loadOrders()])
      if (this.isAdmin) await this.loadAdminData()
      this.page = this.canSell ? 'cashier' : 'orders'
    },
    async loadCategories () {
      const { data, error } = await supabase.from('product_categories').select('*').eq('is_active', true).order('sort_order')
      if (error) { this.notify('تعذر تحميل الأقسام: ' + error.message, 'error'); return }
      this.categories = [{ id: 'all', name: 'كل الأصناف' }, ...(data || [])]
    },
    async signedImage (path) {
      if (!path) return ''
      const { data } = await supabase.storage.from(PRODUCT_BUCKET).createSignedUrl(path, 3600)
      return data?.signedUrl || ''
    },
    async loadProducts () {
      this.productsLoading = true
      const { data, error } = await supabase.from('products').select('*').order('sort_order').order('created_at', { ascending: false })
      if (error) this.notify('تعذر تحميل المنتجات: ' + error.message, 'error')
      else {
        this.products = await Promise.all((data || []).map(async p => ({ ...p, imageUrl: await this.signedImage(p.image_path) })))
      }
      this.productsLoading = false
    },
    async loadOrders () {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(100)
      if (error) this.notify('تعذر تحميل الطلبات: ' + error.message, 'error')
      else this.orders = data || []
    },
    async loadAdminData () {
      if (!this.isAdmin) return
      await Promise.all([this.loadOrders(), this.loadStaff(), this.loadInventory()])
    },
    async loadStaff () {
      const { data, error } = await supabase.from('staff_profiles').select('*').order('created_at', { ascending: false })
      if (!error) this.staff = data || []
    },
    async loadShiftData () {
      const { data: current } = await supabase.rpc('get_my_open_shift')
      this.openShift = current || null
      const { data } = await supabase.from('shifts').select('*').order('opened_at',{ascending:false}).limit(30)
      this.shiftHistory = data || []
    },
    async openShift () {
      this.busy=true
      const {data,error}=await supabase.rpc('open_staff_shift',{p_opening_cash:Number(this.shiftOpeningCash)||0,p_note:this.shiftNote||null})
      this.busy=false
      if(error){this.notify('تعذر فتح الشيفت: '+error.message,'error');return}
      this.openShift=data;this.notify('تم فتح الشيفت بنجاح');await this.loadShiftData()
    },
    async closeShift () {
      if(!this.openShift)return
      this.busy=true
      const {data,error}=await supabase.rpc('close_staff_shift',{p_shift_id:this.openShift.id,p_counted_cash:Number(this.shiftClosingCash)||0,p_note:this.shiftNote||null})
      this.busy=false
      if(error){this.notify('تعذر إقفال الشيفت: '+error.message,'error');return}
      this.lastShiftReport=data;this.openShift=null;this.notify('تم إقفال الشيفت وحفظ التسوية. اضغط طباعة التقرير عند الحاجة');await this.loadShiftData()
    },
    printShiftReport () {
      if(!this.lastShiftReport)return
      const r=this.lastShiftReport;const w=window.open('','_blank','width=420,height=650')
      if(!w){this.notify('اسمح بالنوافذ المنبثقة لطباعة التقرير','error');return}
      w.document.write('<html dir="rtl"><meta charset="utf-8"><title>تسوية الشيفت</title><body style="font-family:Arial;padding:20px"><h2>سومر - تسوية الشيفت</h2><p>المبيعات: '+this.money(r.sales_total)+' ج</p><p>المصروفات: '+this.money(r.expenses_total)+' ج</p><p>النقدية المتوقعة: '+this.money(r.cash_expected)+' ج</p><p>النقدية المعدودة: '+this.money(r.cash_counted)+' ج</p><h3>الفرق: '+this.money(r.difference)+' ج</h3><script>window.onload=()=>window.print()<\/script></body></html>');w.document.close()
    },
    async loadPrintData () {
      const [p,j]=await Promise.all([supabase.from('printer_settings').select('*').order('route'),supabase.from('print_jobs').select('*').in('status',['queued','failed']).order('queued_at').limit(50)])
      if(p.error)this.notify('تعذر تحميل إعدادات الطابعات: '+p.error.message,'error');else this.printerSettings=p.data||[]
      if(j.error)this.notify('تعذر تحميل مهام الطباعة: '+j.error.message,'error');else this.printJobs=j.data||[]
    },
    async savePrinter (printer) {
      const {error}=await supabase.from('printer_settings').update({display_name:printer.display_name,connection_type:printer.connection_type,device_name:printer.device_name,ip_address:printer.ip_address,copies:printer.copies,is_active:printer.is_active,updated_at:new Date().toISOString()}).eq('id',printer.id)
      if(error)this.notify('تعذر حفظ إعداد الطابعة: '+error.message,'error');else this.notify('تم حفظ إعدادات الطابعة')
    },
    async printJob (job) {
      const [{data:order},{data:items},{data:settings}]=await Promise.all([supabase.from('orders').select('*').eq('id',job.order_id).single(),supabase.from('order_items').select('*').eq('order_id',job.order_id).eq('printer_route',job.printer_route),supabase.from('printer_settings').select('*').eq('route',job.printer_route).single()])
      if(!order||!items?.length){this.notify('بيانات مهمة الطباعة غير مكتملة','error');return}
      const w=window.open('','_blank','width=420,height=650');if(!w){this.notify('اسمح بالنوافذ المنبثقة للطباعة','error');return}
      const rows=items.map(x=>'<tr><td>'+x.product_name_snapshot+'</td><td>'+x.quantity+'</td></tr>').join('')
      const copies=Math.max(1,Math.min(4,Number(settings?.copies)||2))
      const slip='<section class="slip"><h2>سومر - '+this.routeLabel(job.printer_route)+'</h2><p>طلب رقم #'+order.order_number+'</p><p>'+(order.order_type==='delivery'?'دليفري':'صالة')+' · '+(order.customer_name||'')+'</p><p>'+(order.delivery_address||'')+'</p><table>'+rows+'</table><p>وقت الطلب: '+this.formatDate(order.created_at)+'</p></section>'
      w.document.write('<html dir="rtl"><meta charset="utf-8"><title>طلب سومر</title><style>body{font-family:Arial;padding:12px}.slip{page-break-after:always}h2,p{text-align:center}table{width:100%;border-collapse:collapse}td{padding:8px;border-bottom:1px dashed #999}</style>'+Array.from({length:copies},()=>slip).join('')+'<script>window.onload=()=>window.print()<\\/script></html>')
      w.document.close()
      await this.setPrintStatus(job,'printed')
    },
    async setPrintStatus(job,status) {
      const {error}=await supabase.rpc('set_print_job_status',{p_job_id:job.id,p_status:status,p_error:null})
      if(error)this.notify('تعذر تحديث حالة الطباعة: '+error.message,'error');else await this.loadPrintData()
    },
    async updateStaff(person,patch) {
      const payload={display_name:person.display_name,role:patch.role||person.role,is_active:patch.is_active===undefined?person.is_active:patch.is_active}
      const {data,error}=await supabase.rpc('staff_update_profile',{p_staff_id:person.id,p_display_name:payload.display_name,p_role:payload.role,p_is_active:payload.is_active})
      if(error)this.notify('تعذر تحديث الموظف: '+error.message,'error');else{Object.assign(person,data);this.notify('تم تحديث بيانات الموظف')}
    },
    async loadInventory () {
      const { data, error } = await supabase.from('inventory_items').select('*').eq('is_active', true).order('display_name')
      if (!error) this.inventory = data || []
    },
    go (page) {
      if (['dashboard', 'products', 'inventory', 'staff', 'printers'].includes(page) && !this.isAdmin) return
      if (page === 'cashier' && !this.canSell) return
      this.page = page; this.mobileNav = false
      if (page === 'orders') this.loadOrders()
      if (page === 'products') { this.loadCategories(); this.loadProducts() }
      if (page === 'dashboard') this.loadAdminData()
      if (page === 'shifts') this.loadShiftData()
      if (page === 'printers') this.loadPrintData()
    },
    addToCart (product) {
      const found = this.cart.find(x => x.id === product.id)
      if (found) found.quantity += 1
      else this.cart.push({ ...product, quantity: 1 })
      this.notify('تمت إضافة ' + product.name)
    },
    changeQty (id, step) {
      const item = this.cart.find(x => x.id === id)
      if (!item) return
      item.quantity += step
      if (item.quantity <= 0) this.removeFromCart(id)
    },
    removeFromCart (id) { this.cart = this.cart.filter(x => x.id !== id) },
    clearCart () { this.cart = []; this.discount = 0; this.deliveryAddress = ''; this.customerName = ''; this.customerPhone = '' },
    async submitOrder () {
      if (!this.canSell) { this.notify('حسابك غير مصرح له بإنشاء الطلبات','error'); return }
      if (!this.cart.length) return
      if (this.orderType === 'delivery' && !this.deliveryAddress.trim()) { this.notify('اكتب عنوان التوصيل أولاً', 'error'); return }
      this.busy = true
      const items = this.cart.map(item => ({ product_id: item.id, quantity: item.quantity }))
      const { data, error } = await supabase.rpc('create_pos_order', {
        p_order_type: this.orderType,
        p_delivery_address: this.deliveryAddress,
        p_customer_name: this.customerName,
        p_customer_phone: this.customerPhone,
        p_discount: this.appliedDiscount,
        p_delivery_fee: this.deliveryFee,
        p_items: items,
        p_payment_method: this.paymentMethod
      })
      this.busy = false
      if (error) { this.notify('لم يتم حفظ الطلب: ' + error.message, 'error'); return }
      this.notify('تم حفظ الطلب رقم #' + data.order_number + ' بنجاح')
      this.clearCart()
      await this.loadOrders()
      this.page = 'orders'
    },
    openNewProduct () {
      this.editingProduct = null
      this.productForm = { name: '', description: '', price: 0, category_id: this.categories.find(c => c.id !== 'all')?.id || '', printer_route: 'main', is_active: true }
      this.selectedImage = null; this.imagePreview = ''; this.removeImage = false; this.modalError = ''; this.productModal = true
    },
    editProduct (p) {
      this.editingProduct = p
      this.productForm = { name: p.name, description: p.description || '', price: Number(p.price), category_id: p.category_id || '', printer_route: p.printer_route || 'main', is_active: p.is_active }
      this.selectedImage = null; this.imagePreview = p.imageUrl || ''; this.removeImage = false; this.modalError = ''; this.productModal = true
    },
    closeProductModal () { this.productModal = false; this.selectedImage = null; this.imagePreview = ''; this.modalError = '' },
    selectImage (event) {
      const file = event.target.files && event.target.files[0]
      if (!file) return
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { this.modalError = 'نوع الصورة غير مدعوم. استخدم JPG أو PNG أو WEBP.'; return }
      if (file.size > 5 * 1024 * 1024) { this.modalError = 'حجم الصورة أكبر من 5 ميجابايت.'; return }
      this.selectedImage = file
      this.imagePreview = URL.createObjectURL(file)
      this.removeImage = false
      this.modalError = ''
    },
    removeSelectedImage () { this.selectedImage = null; this.imagePreview = ''; this.removeImage = true },
    async saveProduct () {
      this.modalError = ''
      if (!this.productForm.name.trim() || !this.productForm.category_id || Number(this.productForm.price) < 0) { this.modalError = 'أكمل اسم المنتج والقسم والسعر بشكل صحيح.'; return }
      this.busy = true
      let imagePath = this.editingProduct ? this.editingProduct.image_path : null
      try {
        if (this.selectedImage) {
          const safeName = this.selectedImage.name.replace(/[^a-zA-Z0-9._-]/g, '-')
          const path = `${this.session.user.id}/${Date.now()}-${safeName}`
          const { error: uploadError } = await supabase.storage.from(PRODUCT_BUCKET).upload(path, this.selectedImage, { contentType: this.selectedImage.type, upsert: false })
          if (uploadError) throw uploadError
          imagePath = path
        } else if (this.removeImage) imagePath = null

        const payload = {
          name: this.productForm.name.trim(),
          description: this.productForm.description.trim() || null,
          price: Number(this.productForm.price),
          category_id: this.productForm.category_id,
          printer_route: this.productForm.printer_route,
          is_active: this.productForm.is_active,
          image_path: imagePath
        }
        let result
        if (this.editingProduct) result = await supabase.from('products').update(payload).eq('id', this.editingProduct.id)
        else result = await supabase.from('products').insert(payload)
        if (result.error) throw result.error
        this.busy = false
        this.closeProductModal()
        await this.loadProducts()
        this.notify('تم حفظ المنتج والصورة بنجاح')
      } catch (e) {
        this.busy = false
        this.modalError = 'تعذر حفظ المنتج: ' + (e.message || 'خطأ غير معروف')
      }
    },
    async toggleProduct (p) {
      const { error } = await supabase.from('products').update({ is_active: !p.is_active }).eq('id', p.id)
      if (error) this.notify('تعذر تحديث المنتج: ' + error.message, 'error')
      else { this.notify(p.is_active ? 'تم إخفاء المنتج من المنيو' : 'تم تفعيل المنتج'); await this.loadProducts() }
    },
    async updateOrderStatus (order, status) {
      const { error } = await supabase.rpc('update_order_status',{p_order_id:order.id,p_status:status})
      if (error) this.notify('تعذر تحديث حالة الطلب: ' + error.message, 'error')
      else { this.notify('تم تحديث حالة الطلب'); await this.loadOrders() }
    },
    categoryName (id) { return this.categories.find(c => c.id === id)?.name || 'بدون قسم' },
    statusLabel (s) { return ({ draft: 'مسودة', confirmed: 'مؤكد', preparing: 'قيد التحضير', ready: 'جاهز', out_for_delivery: 'خرج للتوصيل', completed: 'مكتمل', cancelled: 'ملغي' })[s] || s },
    roleName (r) { return ({ owner_admin: 'مدير النظام', manager: 'مدير', cashier: 'كاشير', kitchen: 'مطبخ', delivery: 'دليفري' })[r] || 'موظف' },
    routeLabel (r) { return ({ main: 'رئيسية', shawarma: 'شاورما', burger: 'برجر' })[r] || 'رئيسية' },
    formatDate (value) { return new Date(value).toLocaleString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
:root{font-family:'Cairo',sans-serif;color:#30271f;background:#f5f2ed;font-synthesis:none}
*{box-sizing:border-box}body{margin:0;background:#f5f2ed}button,input,select,textarea{font:inherit}button{cursor:pointer}
.app-shell{min-height:100vh;display:flex;background:#f5f2ed}.boot-screen{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;background:#241912;color:#fff;z-index:100}.boot-screen span{color:#b9a18d;font-size:12px}
.brand-mark{width:46px;height:46px;display:grid;place-items:center;border-radius:15px;background:linear-gradient(145deg,#f1d5aa,#b77d4d);color:#382216;font-size:28px;font-weight:900;box-shadow:0 8px 24px #0003,inset 2px 2px 5px #fff9}
.auth-screen{width:100%;min-height:100vh;display:grid;grid-template-columns:1.1fr .9fr;background:#fff}.auth-art{position:relative;overflow:hidden;min-height:100vh;padding:48px 7%;color:#fff;background:radial-gradient(circle at 78% 65%,#70452d 0,transparent 34%),linear-gradient(145deg,#38251b,#1b120e 78%)}.auth-orbit{position:absolute;border:1px solid #c69b6a26;border-radius:50%;width:550px;height:550px;right:-100px;bottom:-160px}.orbit-two{width:400px;height:400px;right:-25px;bottom:-85px;border-color:#d6ad7c20}.auth-brand,.side-brand{display:flex;align-items:center;gap:13px}.auth-brand b,.side-brand b{font-size:24px;font-weight:900;display:block}.auth-brand small,.side-brand small{display:block;font-size:8px;letter-spacing:2px;color:#bca58e}.auth-copy{position:relative;margin-top:19vh;z-index:1}.kicker{font-size:9px;letter-spacing:2px;font-weight:900;color:#c9a579}.auth-copy h1{font-size:clamp(35px,5vw,64px);line-height:1.45;margin:18px 0;font-weight:900}.auth-copy h1 em{font-style:normal;color:#d5ad7b}.auth-copy p{color:#c9b8a9;font-size:14px}.auth-points{display:flex;gap:24px;flex-wrap:wrap;margin-top:38px;color:#d4b58e;font-size:11px}.auth-art-footer{position:absolute;bottom:30px;left:7%;font-size:9px;letter-spacing:3px;color:#927c69}.auth-panel{display:grid;place-items:center;padding:35px}.auth-panel-inner{width:min(100%,390px)}.gold{color:#a77c52}.auth-panel h2{font-size:31px;margin:10px 0 3px;font-weight:900}.muted,.auth-panel .muted{color:#9a9086;font-size:12px}.auth-form{display:flex;flex-direction:column;gap:9px;margin-top:32px}.auth-form label,.field label{font-size:11px;font-weight:800;color:#67584b}.auth-form input,.field input,.field select,.field textarea{width:100%;border:1px solid #e8e0d7;border-radius:10px;background:#fff;padding:12px 13px;outline:0;color:#34291f;font-size:12px}.auth-form input:focus,.field input:focus,.field select:focus,.field textarea:focus{border-color:#bd9368;box-shadow:0 0 0 3px #bd936817}.primary-btn{border:0;border-radius:10px;padding:12px 18px;background:linear-gradient(110deg,#8b5e3d,#4b2d1e);color:#fff;font-size:11px;font-weight:900;box-shadow:0 7px 18px #603d2826}.primary-btn:hover{filter:brightness(1.08);transform:translateY(-1px)}.primary-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}.primary-btn span{margin-right:16px}.wide{width:100%}.auth-form .primary-btn{margin-top:12px;padding:15px}.alert{padding:12px;border-radius:9px;font-size:11px;margin-top:15px}.error{background:#fff0ed;color:#a44939}.auth-help{border-top:1px solid #eee8e1;margin-top:30px;padding-top:16px;color:#a59a90;font-size:10px;line-height:1.9}
.sidebar{width:245px;min-width:245px;min-height:100vh;padding:27px 17px 18px;display:flex;flex-direction:column;color:#fff;background:linear-gradient(165deg,#38271d,#1d1511 82%);position:sticky;top:0;height:100vh}.side-brand{padding:0 7px 43px}.side-caption{font-size:10px;color:#a38e7c;padding:0 13px;margin-bottom:12px;font-weight:800}.side-gap{margin-top:32px}.side-link{height:46px;width:100%;display:flex;align-items:center;gap:13px;padding:0 14px;margin-bottom:5px;border:0;border-radius:10px;background:transparent;color:#c9bdb2;text-align:right;font-size:12px;transition:.2s}.side-link>span{font-size:18px;width:19px;text-align:center}.side-link:hover{background:#ffffff0c;color:#fff}.side-link.active{color:#f2d2a7;background:linear-gradient(90deg,#c393632c,#c393630b);box-shadow:inset -3px 0 #d6a776}.side-link i{font-style:normal;margin-right:auto;background:#ffffff16;border-radius:20px;padding:2px 8px;font-size:9px}.side-bottom{margin-top:auto}.connection{display:flex;align-items:center;gap:9px;padding:12px;border:1px solid #ffffff13;background:#ffffff08;border-radius:10px;color:#c7b8a9;font-size:9px;margin-bottom:17px}.connection i{width:7px;height:7px;border-radius:50%;background:#78c697;box-shadow:0 0 9px #78c697}.profile{border-top:1px solid #ffffff1b;padding:15px 3px 0;display:flex;align-items:center;gap:9px}.profile-avatar,.top-avatar{width:37px;height:37px;display:grid;place-items:center;border-radius:12px;background:linear-gradient(145deg,#d4a779,#86563b);color:#fff;font-weight:900}.profile-text{min-width:0;flex:1}.profile-text b{font-size:10px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.profile-text small{font-size:9px;color:#b4a293}.logout{border:0;background:#ffffff10;color:#ddc6aa;border-radius:8px;width:29px;height:29px}.main-area{min-width:0;flex:1;max-width:1800px;margin:0 auto;padding:27px 32px 35px}.topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px}.breadcrumb{font-size:9px;color:#a89b8f}.breadcrumb span{padding:0 7px;color:#c8bcb0}.topbar h1{font-size:24px;font-weight:900;margin:3px 0 0}.topbar-right{display:flex;align-items:center;gap:17px}.language-toggle{border:1px solid #d9c5b1;background:#fff;color:#65452f;border-radius:9px;padding:8px 13px;font-size:11px;font-weight:900;white-space:nowrap}.staff-modal{max-width:520px}.live-time{text-align:left;border-left:1px solid #e5ddd3;padding-left:16px}.live-time b{display:block;font-size:13px}.live-time small{display:block;font-size:9px;color:#9a8f84}.top-avatar{border-radius:50%}.mobile-menu,.mobile-close{display:none}.notice{position:sticky;top:10px;z-index:20;padding:11px 15px;border-radius:9px;margin-bottom:13px;font-size:11px;box-shadow:0 7px 20px #0000000b}.notice button{float:left;border:0;background:transparent;font-size:18px;color:inherit}.notice.success{background:#eaf6ed;color:#34784a}.notice.error{background:#fff0ed;color:#a44939}
.welcome-banner{height:205px;position:relative;overflow:hidden;border-radius:19px;padding:29px 34px;color:#fff;background:radial-gradient(circle at 78% 40%,#785033 0,transparent 32%),linear-gradient(110deg,#261912,#563724 72%,#795237);box-shadow:0 15px 35px #4a2d1d1c}.welcome-banner:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,#241711 0%,#241711dd 38%,transparent 100%)}.welcome-text{position:relative;z-index:2}.welcome-text h2{font-size:33px;margin:10px 0 3px;font-weight:900}.welcome-text h2 span{color:#d6ae7e}.welcome-text p{font-size:11px;color:#d3c0ad;margin:0}.banner-decoration{position:absolute;left:16%;top:-85px;width:360px;height:360px;border:1px solid #e5c59a30;border-radius:50%;z-index:1;display:grid;place-items:center}.plate-ring{width:250px;height:250px;border:17px double #d9bd9850;border-radius:50%;box-shadow:0 0 0 25px #ffffff08,0 0 55px #d3a06b24}.banner-letter{position:absolute;font-size:155px;font-weight:900;color:#e0bc8b25}.banner-tag{position:absolute;z-index:2;left:25px;bottom:20px;color:#d8b68e;font-size:9px}.banner-tag b{margin-right:15px;letter-spacing:2px}.mode-strip{display:flex;align-items:center;gap:22px;padding:13px 17px;margin:17px 0 20px;background:#fff;border:1px solid #ebe4dc;border-radius:12px}.mode-strip>div:first-child b{display:block;font-size:11px}.mode-strip>div:first-child small,.order-sequence small{display:block;font-size:9px;color:#a1968b}.mode-switch{display:flex;gap:4px;background:#f4f0eb;padding:4px;border-radius:9px}.mode-switch button{border:0;background:transparent;border-radius:7px;padding:7px 17px;color:#7e7064;font-size:10px;font-weight:800}.mode-switch button.chosen{background:#69452f;color:#fff;box-shadow:0 4px 10px #69452f35}.order-sequence{margin-right:auto;text-align:left}.order-sequence b{font-size:10px;color:#8a6244}.cashier-layout{display:grid;grid-template-columns:minmax(0,1fr) 345px;gap:19px;align-items:start}.menu-panel{min-width:0}.section-heading,.page-intro{display:flex;justify-content:space-between;align-items:end;margin-bottom:14px}.section-heading h2,.page-intro h2{font-size:22px;margin:2px 0 0;font-weight:900}.section-heading p,.page-intro p{font-size:10px;color:#9d9287;margin:0}.item-counter{font-size:9px;color:#926b49;background:#eee5da;padding:6px 12px;border-radius:20px}.searchbar{display:flex;align-items:center;gap:10px;height:42px;padding:0 12px;background:#fff;border:1px solid #eae3da;border-radius:9px}.searchbar>span{font-size:22px;color:#9b7658}.searchbar input{min-width:0;flex:1;border:0;outline:0;background:transparent;font-size:10px}.searchbar button{border:0;background:transparent;color:#967454;font-size:10px}.category-row{display:flex;gap:7px;overflow:auto;padding:12px 0 14px}.category-row button,.filter-tabs button{flex:0 0 auto;border:1px solid #e9e1d8;border-radius:8px;background:#fff;color:#786c61;padding:8px 13px;font-size:10px}.category-row button.selected,.filter-tabs button.active{background:#68442f;color:#fff;border-color:#68442f}.product-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px}.product-card{padding:0;overflow:hidden;text-align:right;border:1px solid #ece5dd;border-radius:12px;background:#fff;color:#332920;box-shadow:0 4px 12px #33231508;transition:.2s}.product-card:hover{transform:translateY(-3px);box-shadow:0 12px 25px #33231515;border-color:#d5b897}.product-photo{height:125px;position:relative;background:#e9dfd3;overflow:hidden}.product-photo img,.admin-product-image img,.cart-thumb img{width:100%;height:100%;object-fit:cover;display:block}.photo-placeholder{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle,#896445,#38251b);color:#e9c99d}.photo-placeholder span{font-size:48px;font-weight:900}.photo-placeholder small{font-size:7px;letter-spacing:4px}.photo-add{position:absolute;bottom:8px;left:8px;width:28px;height:28px;display:grid;place-items:center;background:#fff;color:#70472e;border-radius:8px;font-size:20px;box-shadow:0 4px 10px #0003}.product-card-body{padding:9px 10px 11px}.product-card-body>b{display:block;font-size:11px}.product-card-body p{font-size:9px;color:#9d938a;margin:3px 0;min-height:17px;line-height:1.7}.product-card-foot{display:flex;justify-content:space-between;align-items:center;margin-top:8px}.product-card-foot strong{font-size:13px;color:#805337}.product-card-foot small{font-size:8px}.product-card-foot>span{font-size:8px;color:#987453}.empty-state{grid-column:1/-1;text-align:center;padding:38px 15px;background:#fff;border:1px dashed #e5dbd0;border-radius:12px;color:#8e8175;font-size:11px}.empty-state p{font-size:10px}.empty-icon{font-size:25px;color:#b38a62}.outline-btn{border:1px solid #d9c7b3;border-radius:9px;background:#fff;color:#795438;padding:9px 13px;font-size:10px;font-weight:800}.cart-panel{position:sticky;top:14px;padding:16px;background:#fff;border:1px solid #e9e2da;border-radius:14px;box-shadow:0 8px 25px #35251b08}.cart-head{display:flex;align-items:center;justify-content:space-between;padding-bottom:12px;border-bottom:1px solid #f0ebe5}.cart-head h3{font-size:17px;margin:1px 0 0}.cart-count{width:28px;height:28px;display:grid;place-items:center;border-radius:8px;background:#f1e8de;color:#80583a;font-size:10px;font-weight:900}.cart-mode{display:flex;align-items:center;gap:8px;margin:12px 0;padding:9px;background:#f7f3ee;border-radius:8px;color:#78543b;font-size:10px;font-weight:800}.cart-mode>span{font-size:16px}.cart-mode small{margin-right:auto;color:#a17e5d;font-size:8px}.cart-items{max-height:250px;overflow:auto}.cart-row{display:flex;align-items:center;gap:8px;padding:9px 0;border-bottom:1px solid #f2ede8}.cart-thumb{width:45px;height:45px;flex:0 0 45px;display:grid;place-items:center;overflow:hidden;border-radius:8px;background:#eee3d7;color:#956d4b;font-weight:900}.cart-row-info{flex:1;min-width:0}.cart-row-info>b{display:block;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cart-row-info>small{font-size:9px;color:#a1958a}.qty-control{display:flex;align-items:center;gap:8px;margin-top:4px}.qty-control button{width:19px;height:19px;border:1px solid #e8dfd6;border-radius:5px;background:#fff;color:#835a3b}.qty-control b{font-size:9px}.cart-row-total{display:flex;flex-direction:column;align-items:end;gap:6px}.cart-row-total>b{font-size:10px}.cart-row-total button{width:19px;height:19px;border:0;border-radius:5px;background:#fff0ed;color:#b26b5b}.cart-empty{text-align:center;padding:24px 10px;color:#9b8d80}.cart-empty div{width:40px;height:40px;display:grid;place-items:center;margin:0 auto 8px;border-radius:50%;background:#f4eee7;color:#98704f;font-size:22px}.cart-empty b{font-size:11px;color:#5d4b3d}.cart-empty p{font-size:9px}.cart-fields{border-top:1px solid #eee8e1;padding-top:10px;margin-top:7px}.field{display:flex;flex-direction:column;gap:5px;margin-bottom:9px}.field label{font-size:9px}.field input,.field select,.field textarea{padding:9px 10px;border-radius:7px;font-size:10px}.cart-summary{border-top:1px solid #eee8e1;padding-top:10px}.cart-summary>div{display:flex;justify-content:space-between;margin:8px 0;font-size:10px;color:#92877d}.cart-summary>div b{color:#51443a}.discount-line b{color:#4d956d!important}.total-line{border-top:1px dashed #e4dcd2;padding-top:11px;margin-top:12px!important;align-items:center;color:#34291f!important;font-weight:900}.total-line strong{font-size:20px;color:#805137}.total-line small{font-size:8px}.confirm-btn{margin-top:8px;padding:13px}.text-btn{border:0;background:transparent;color:#a57d6c;font-size:9px;padding:10px}
.page-content{animation:pageIn .25s ease}@keyframes pageIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}.page-intro{align-items:center;margin-bottom:19px}.page-intro h2{font-size:25px}.page-intro .primary-btn{padding:12px 16px}.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:13px;margin-bottom:17px}.stat-card{position:relative;overflow:hidden;padding:18px;background:#fff;border:1px solid #ece5dd;border-radius:12px}.stat-card>span{display:block;color:#8d8176;font-size:10px}.stat-card>b{display:block;font-size:25px;margin:8px 0 1px;color:#493326}.stat-card>b small{font-size:11px}.stat-card>small{font-size:9px;color:#a79b90}.stat-card>i{position:absolute;left:15px;top:14px;font-style:normal;font-size:24px;color:#b58b61;background:#f5eee6;width:42px;height:42px;display:grid;place-items:center;border-radius:12px}.admin-grid{display:grid;grid-template-columns:1.3fr .7fr;gap:15px}.surface-card{background:#fff;border:1px solid #eae3da;border-radius:13px;padding:17px}.surface-title{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.surface-title h3{font-size:14px;margin:0}.surface-title p{font-size:9px;color:#a0958a;margin:2px 0 0}.link-btn{border:0;background:transparent;color:#98704f;font-size:10px}.order-mini{display:flex;align-items:center;gap:12px;padding:12px 0;border-top:1px solid #f1ece6}.order-mini>div{flex:1}.order-mini>div>b{display:block;font-size:11px}.order-mini>div>small{display:block;font-size:9px;color:#a3988e}.order-mini>strong{font-size:11px}.status-pill{display:inline-block;padding:4px 8px;border-radius:20px;background:#f5eee5;color:#8a6849;font-size:8px;white-space:nowrap}.status-pill.preparing{background:#fff4dd;color:#a47725}.status-pill.ready{background:#e9f4ec;color:#41815a}.status-pill.completed{background:#e8f2f1;color:#397f78}.status-pill.cancelled{background:#fff0ed;color:#b35b4c}.quick-actions>button{width:100%;display:flex;align-items:center;gap:11px;padding:12px 0;border:0;border-top:1px solid #f1ece6;background:#fff;text-align:right}.quick-actions>button>span{width:34px;height:34px;display:grid;place-items:center;border-radius:9px;background:#f4eee7;color:#865c3c;font-size:17px}.quick-actions>button>div{flex:1}.quick-actions>button b{display:block;font-size:10px}.quick-actions>button small{font-size:9px;color:#a0958a}.quick-actions>button>i{font-style:normal;color:#9a7857}.toolbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:13px}.admin-search{max-width:340px;flex:1}.toolbar>.muted{font-size:10px}.admin-product-row{display:flex;align-items:center;gap:12px;padding:11px 0;border-top:1px solid #f1ece6}.admin-product-image{width:54px;height:54px;flex:0 0 54px;overflow:hidden;border-radius:9px;background:#eee4d8;display:grid;place-items:center;color:#956d4b;font-size:22px;font-weight:900}.admin-product-main{min-width:0;flex:1}.admin-product-main>b,.admin-product-main>small,.admin-product-main>span{display:block}.admin-product-main>b{font-size:11px}.admin-product-main>small{font-size:9px;color:#9e9389;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.admin-product-main>span{font-size:8px;color:#b08b68;margin-top:3px}.admin-price{font-size:11px;color:#805337;white-space:nowrap}.active-label{font-size:8px;color:#43865d;background:#eaf5ed;padding:4px 8px;border-radius:20px;white-space:nowrap}.active-label.inactive{color:#a16a5a;background:#fff0ed}.icon-btn{width:29px;height:29px;border:1px solid #e9e0d7;border-radius:7px;background:#fff;color:#8b6849}.icon-btn.danger{color:#b56b5a}.filter-tabs{display:flex;gap:6px;overflow:auto}.order-admin-row{display:grid;grid-template-columns:1fr 1fr 1.5fr auto auto auto;gap:13px;align-items:center;padding:13px 0;border-top:1px solid #f1ece6}.order-admin-id b,.order-admin-id small,.order-admin-type b,.order-admin-type small{display:block}.order-admin-id b,.order-admin-type b{font-size:10px}.order-admin-id small,.order-admin-type small,.order-admin-address{font-size:9px;color:#9f948a}.order-admin-address{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.order-admin-row>strong{font-size:10px;white-space:nowrap}.status-select{border:1px solid #e9e0d7;border-radius:7px;padding:6px;font-size:9px;background:#fff;max-width:120px}.inventory-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.inventory-card{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid #ece5dd;border-radius:12px;padding:16px}.inventory-symbol{width:42px;height:42px;display:grid;place-items:center;border-radius:11px;background:#f4eee7;color:#966e4d;font-size:20px}.inventory-card>div:nth-child(2){flex:1}.inventory-card b,.inventory-card small{display:block}.inventory-card b{font-size:12px}.inventory-card small{font-size:9px;color:#a0958a}.inventory-card>strong{font-size:14px;color:#805337}.inventory-card>strong small{display:inline;font-size:9px}.info-note{margin-top:14px;padding:13px 15px;border-radius:9px;background:#f3ede5;color:#8a7058;font-size:10px;line-height:1.8}.printer-setting-row{display:grid;grid-template-columns:1fr 1.2fr 1fr 1fr auto auto;gap:9px;align-items:center;padding:13px 0;border-bottom:1px solid #f1ece6}.printer-setting-row input,.printer-setting-row select{min-width:0;border:1px solid #e8e0d7;border-radius:8px;padding:8px;font-size:10px}.printer-setting-row label{font-size:10px;white-space:nowrap}.printer-setting-row label input{width:auto}.shift-summary{padding:10px}.shift-summary h3{margin-top:0}.shift-summary p{font-size:11px;color:#95877b}.staff-row{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #f1ece6}.staff-row:last-child{border-bottom:0}.staff-info{flex:1;min-width:0}.staff-info b,.staff-info small{display:block}.staff-info b{font-size:11px}.staff-info small{font-size:8px;color:#a0958a;overflow:hidden;text-overflow:ellipsis}.role-pill{font-size:8px;color:#876344;background:#f5eee6;padding:5px 9px;border-radius:20px}.empty-state.compact{padding:20px}.empty-state.full{grid-column:1/-1}
.modal-backdrop{position:fixed;inset:0;z-index:50;background:#1b120ec9;backdrop-filter:blur(5px);display:grid;place-items:center;padding:18px;overflow:auto}.product-modal{width:min(100%,590px);max-height:94vh;overflow:auto;background:#fff;border-radius:17px;padding:22px;box-shadow:0 25px 80px #0005}.modal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:15px}.modal-head h2{font-size:20px;margin:3px 0}.modal-close{width:31px;height:31px;border:0;border-radius:8px;background:#f4eee8;color:#80583a;font-size:20px}.image-upload{height:165px;position:relative;overflow:hidden;display:grid;place-items:center;border:1px dashed #d7c5b2;border-radius:12px;background:#faf7f3;cursor:pointer;margin-bottom:15px}.image-upload>img{width:100%;height:100%;object-fit:contain;background:#eee7df}.upload-placeholder{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:5px;color:#876344}.upload-placeholder>span{font-size:27px}.upload-placeholder b{font-size:11px}.upload-placeholder small{font-size:9px;color:#a4998d}.remove-image{position:absolute;left:9px;bottom:9px;border:0;border-radius:7px;padding:6px 9px;background:#40291fe8;color:#fff;font-size:9px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 12px}.field.full{grid-column:1/-1}.field textarea{resize:vertical}.modal-actions{display:flex;justify-content:flex-start;gap:9px;border-top:1px solid #f0ebe5;padding-top:15px;margin-top:6px}.modal-error{color:#b44e40;font-size:10px}
@media(max-width:1250px){.cashier-layout{grid-template-columns:minmax(0,1fr) 315px}.product-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.stats-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:900px){.sidebar{width:205px;min-width:205px}.main-area{padding:20px}.cashier-layout{grid-template-columns:1fr}.cart-panel{position:static}.admin-grid{grid-template-columns:1fr}.order-admin-row{grid-template-columns:1fr 1fr auto}.order-admin-address{display:none}.order-admin-row .status-select{grid-column:1/-1;max-width:none}}
@media(max-width:680px){.auth-screen{grid-template-columns:1fr}.auth-art{display:none}.auth-panel{min-height:100vh;padding:25px}.sidebar{position:fixed;z-index:60;right:0;top:0;bottom:0;width:270px;min-width:270px;height:100vh;transform:translateX(110%);transition:.25s;box-shadow:-15px 0 40px #0002}.sidebar.sidebar-open{transform:translateX(0)}.mobile-menu{display:block;border:0;background:#fff;border-radius:8px;padding:8px 10px;color:#765137;margin-left:10px}.mobile-close{display:block;margin-right:auto;border:0;background:#ffffff15;color:#fff;border-radius:7px;width:28px;height:28px;font-size:18px}.topbar{justify-content:flex-start}.topbar>div:nth-child(2){flex:1}.topbar h1{font-size:20px}.topbar-right{gap:8px}.live-time{display:none}.main-area{padding:15px 11px 25px}.welcome-banner{height:180px;padding:22px}.welcome-text h2{font-size:25px}.welcome-text p{max-width:240px;line-height:1.9}.banner-decoration{left:-35%;opacity:.6}.mode-strip{gap:10px;flex-wrap:wrap;padding:12px}.mode-switch button{padding:7px 11px}.order-sequence{margin-right:auto}.product-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.product-photo{height:105px}.section-heading h2{font-size:19px}.stats-grid{gap:8px}.stat-card{padding:13px}.stat-card>b{font-size:21px}.stat-card>i{width:32px;height:32px;font-size:18px}.page-intro{align-items:flex-start;gap:10px}.page-intro h2{font-size:20px}.page-intro p{max-width:250px;line-height:1.8}.page-intro .primary-btn,.page-intro .outline-btn{white-space:nowrap;padding:9px;font-size:9px}.surface-card{padding:12px}.admin-product-row{gap:7px;flex-wrap:wrap}.admin-product-image{width:45px;height:45px;flex-basis:45px}.admin-product-main{min-width:calc(100% - 60px)}.admin-price{margin-right:52px}.order-admin-row{gap:7px}.order-admin-row .status-pill{justify-self:start}.inventory-grid{grid-template-columns:1fr}.form-grid{grid-template-columns:1fr}.field.full{grid-column:auto}.product-modal{padding:15px}.toolbar{gap:8px}.filter-tabs button{padding:7px 9px;font-size:9px}}
</style>
