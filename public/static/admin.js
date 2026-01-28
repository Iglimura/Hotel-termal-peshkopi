// ============== ADMIN PANEL ==============

// State
let currentView = 'dashboard';
let stats = {};
let bookings = [];
let rooms = [];
let reviews = [];
let content = {};
let posts = [];
let financeRecords = [];
let financeStats = {};
let selectedYear = new Date().getFullYear().toString();
let expenseCategories = [];
let revenueChart = null;
let expensePieChart = null;
let profitLossChart = null;

// Auth check
const token = localStorage.getItem('adminToken');
if (!token) {
  window.location.href = '/login';
}

// Verify token
async function verifyAuth() {
  try {
    const res = await fetch('/api/admin/verify', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!data.valid) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
  } catch (error) {
    localStorage.removeItem('adminToken');
    window.location.href = '/login';
  }
}

// Fetch all data
async function fetchAllData() {
  try {
    const [statsRes, bookingsRes, roomsRes, reviewsRes, contentRes, postsRes, financeRes, categoriesRes, financeStatsRes] = await Promise.all([
      fetch('/api/admin/stats'),
      fetch('/api/bookings'),
      fetch('/api/rooms'),
      fetch('/api/reviews'),
      fetch('/api/content'),
      fetch('/api/posts'),
      fetch(`/api/finance?year=${selectedYear}`),
      fetch('/api/finance/categories'),
      fetch(`/api/finance/stats?year=${selectedYear}`)
    ]);
    
    stats = await statsRes.json();
    bookings = await bookingsRes.json();
    rooms = await roomsRes.json();
    reviews = await reviewsRes.json();
    content = await contentRes.json();
    posts = await postsRes.json();
    financeRecords = await financeRes.json();
    expenseCategories = await categoriesRes.json();
    financeStats = await financeStatsRes.json();
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Render admin app
function renderAdmin() {
  const app = document.getElementById('admin-app');
  app.innerHTML = `
    <div class="flex min-h-screen">
      ${renderSidebar()}
      <main class="flex-1 bg-gray-100">
        ${renderHeader()}
        <div class="p-6">
          ${renderCurrentView()}
        </div>
      </main>
    </div>
    ${renderModal()}
  `;
  
  if (currentView === 'dashboard') {
    setTimeout(initRevenueChart, 100);
  }
  if (currentView === 'calendar') {
    setTimeout(initCalendar, 100);
  }
  if (currentView === 'finance') {
    setTimeout(initFinanceCharts, 100);
  }
}

function renderSidebar() {
  const menuItems = [
    { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
    { id: 'calendar', icon: 'fa-calendar-alt', label: 'Calendar' },
    { id: 'bookings', icon: 'fa-book', label: 'Bookings' },
    { id: 'rooms', icon: 'fa-bed', label: 'Rooms CMS' },
    { id: 'content', icon: 'fa-edit', label: 'Content CMS' },
    { id: 'reviews', icon: 'fa-star', label: 'Reviews' },
    { id: 'blog', icon: 'fa-newspaper', label: 'Blog Manager' },
    { id: 'finance', icon: 'fa-coins', label: 'Financa' },
  ];
  
  return `
    <aside class="w-64 bg-emerald-800 text-white flex-shrink-0">
      <div class="p-6">
        <div class="flex items-center gap-3 mb-8">
          <div class="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
            <i class="fas fa-hotel"></i>
          </div>
          <div>
            <h1 class="font-bold">Hotel Termal</h1>
            <p class="text-xs text-emerald-300">Admin Panel</p>
          </div>
        </div>
        
        <nav class="space-y-2">
          ${menuItems.map(item => `
            <button 
              onclick="setView('${item.id}')"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentView === item.id ? 'bg-emerald-700 text-white' : 'text-emerald-200 hover:bg-emerald-700/50'}">
              <i class="fas ${item.icon} w-5"></i>
              <span>${item.label}</span>
            </button>
          `).join('')}
        </nav>
      </div>
      
      <div class="absolute bottom-0 w-64 p-6 border-t border-emerald-700">
        <a href="/" class="flex items-center gap-2 text-emerald-200 hover:text-white transition text-sm">
          <i class="fas fa-external-link-alt"></i>
          View Website
        </a>
        <button onclick="logout()" class="flex items-center gap-2 text-emerald-200 hover:text-white transition text-sm mt-3">
          <i class="fas fa-sign-out-alt"></i>
          Logout
        </button>
      </div>
    </aside>
  `;
}

function renderHeader() {
  return `
    <header class="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-gray-800 capitalize">${currentView}</h2>
        <p class="text-sm text-gray-500">Manage your hotel</p>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-sm text-gray-500">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        <div class="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
          <i class="fas fa-user text-emerald-600"></i>
        </div>
      </div>
    </header>
  `;
}

function renderCurrentView() {
  switch (currentView) {
    case 'dashboard': return renderDashboard();
    case 'calendar': return renderCalendar();
    case 'bookings': return renderBookings();
    case 'rooms': return renderRoomsCMS();
    case 'content': return renderContentCMS();
    case 'reviews': return renderReviewsCMS();
    case 'blog': return renderBlogCMS();
    case 'finance': return renderFinance();
    default: return renderDashboard();
  }
}

// ============== DASHBOARD ==============
function renderDashboard() {
  return `
    <div class="space-y-6">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Total Revenue</p>
              <p class="text-2xl font-bold text-gray-800">€${stats.totalRevenue || 0}</p>
            </div>
            <div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-euro-sign text-emerald-600 text-xl"></i>
            </div>
          </div>
          <p class="text-xs text-emerald-600 mt-2"><i class="fas fa-arrow-up mr-1"></i>From confirmed bookings</p>
        </div>
        
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Website Clicks</p>
              <p class="text-2xl font-bold text-gray-800">${stats.websiteClicks || 0}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-mouse-pointer text-blue-600 text-xl"></i>
            </div>
          </div>
          <p class="text-xs text-blue-600 mt-2"><i class="fas fa-chart-line mr-1"></i>This month</p>
        </div>
        
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Occupancy Rate</p>
              <p class="text-2xl font-bold text-gray-800">${stats.occupancyRate || 0}%</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-bed text-purple-600 text-xl"></i>
            </div>
          </div>
          <div class="mt-2 bg-gray-200 rounded-full h-2">
            <div class="bg-purple-600 h-2 rounded-full" style="width: ${stats.occupancyRate || 0}%"></div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Total Bookings</p>
              <p class="text-2xl font-bold text-gray-800">${stats.totalBookings || 0}</p>
            </div>
            <div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-calendar-check text-amber-600 text-xl"></i>
            </div>
          </div>
          <p class="text-xs text-amber-600 mt-2">${stats.confirmedBookings || 0} confirmed</p>
        </div>
      </div>
      
      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="font-bold text-gray-800 mb-4">Monthly Revenue</h3>
          <canvas id="revenueChart" height="200"></canvas>
        </div>
        
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="font-bold text-gray-800 mb-4">Recent Bookings</h3>
          <div class="space-y-4">
            ${bookings.slice(0, 5).map(booking => `
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p class="font-medium text-gray-800">${booking.guestName}</p>
                  <p class="text-sm text-gray-500">${booking.checkIn} - ${booking.checkOut}</p>
                </div>
                <span class="px-3 py-1 text-xs font-medium rounded-full ${booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">
                  ${booking.status}
                </span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function initRevenueChart() {
  const ctx = document.getElementById('revenueChart');
  if (!ctx) return;
  
  if (revenueChart) revenueChart.destroy();
  
  revenueChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: stats.monthlyRevenue?.map(m => m.month) || [],
      datasets: [{
        label: 'Revenue (€)',
        data: stats.monthlyRevenue?.map(m => m.revenue) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// ============== CALENDAR ==============
function renderCalendar() {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  return `
    <div class="space-y-6">
      <!-- iCal Sync -->
      <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-bold text-emerald-800 flex items-center gap-2">
              <i class="fas fa-sync"></i>
              iCal Sync for Booking.com
            </h3>
            <p class="text-sm text-emerald-600 mt-1">Copy this link to sync with external booking platforms</p>
            <div class="flex items-center gap-2 mt-3">
              <input 
                type="text" 
                id="icalUrl" 
                readonly 
                value="${window.location.origin}/api/ical"
                class="flex-1 px-4 py-2 border border-emerald-300 rounded-lg bg-white text-sm">
              <button 
                onclick="copyIcalUrl()"
                class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2">
                <i class="fas fa-copy"></i>
                Copy Link
              </button>
            </div>
          </div>
          <a href="/api/ical" download class="px-4 py-2 bg-white border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50 transition flex items-center gap-2">
            <i class="fas fa-download"></i>
            Download .ics
          </a>
        </div>
      </div>
      
      <!-- Calendar View -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-800">
            ${new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button 
            onclick="openBookingModal()"
            class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2">
            <i class="fas fa-plus"></i>
            Add Booking
          </button>
        </div>
        
        <div id="calendarGrid" class="grid grid-cols-7 gap-2">
          ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => 
            `<div class="text-center py-2 font-semibold text-gray-500 text-sm">${day}</div>`
          ).join('')}
        </div>
      </div>
      
      <!-- Bookings List -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="font-bold text-gray-800 mb-4">Upcoming Bookings</h3>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-left text-sm text-gray-500 border-b">
                <th class="pb-3 font-medium">Guest</th>
                <th class="pb-3 font-medium">Room</th>
                <th class="pb-3 font-medium">Check-in</th>
                <th class="pb-3 font-medium">Check-out</th>
                <th class="pb-3 font-medium">Status</th>
                <th class="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${bookings.map(booking => {
                const room = rooms.find(r => r.id === booking.roomId);
                return `
                  <tr class="border-b hover:bg-gray-50">
                    <td class="py-4">
                      <div>
                        <p class="font-medium text-gray-800">${booking.guestName}</p>
                        <p class="text-sm text-gray-500">${booking.phone}</p>
                      </div>
                    </td>
                    <td class="py-4 text-gray-600">${room?.name?.en || 'N/A'}</td>
                    <td class="py-4 text-gray-600">${booking.checkIn}</td>
                    <td class="py-4 text-gray-600">${booking.checkOut}</td>
                    <td class="py-4">
                      <select 
                        onchange="updateBookingStatus('${booking.id}', this.value)"
                        class="px-3 py-1 text-sm rounded-full border ${booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : booking.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}">
                        <option value="pending" ${booking.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="confirmed" ${booking.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="cancelled" ${booking.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                      </select>
                    </td>
                    <td class="py-4">
                      <button onclick="editBooking('${booking.id}')" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button onclick="deleteBooking('${booking.id}')" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function initCalendar() {
  const grid = document.getElementById('calendarGrid');
  if (!grid) return;
  
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  let calendarHTML = grid.innerHTML;
  
  // Empty cells for days before the first day
  for (let i = 0; i < firstDay; i++) {
    calendarHTML += `<div class="aspect-square"></div>`;
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayBookings = bookings.filter(b => 
      new Date(b.checkIn) <= new Date(dateStr) && 
      new Date(b.checkOut) > new Date(dateStr) &&
      b.status !== 'cancelled'
    );
    
    const isToday = day === today.getDate();
    
    calendarHTML += `
      <div class="aspect-square border rounded-lg p-1 ${isToday ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'} hover:border-emerald-300 transition cursor-pointer" onclick="openBookingModal('${dateStr}')">
        <div class="text-sm font-medium ${isToday ? 'text-emerald-700' : 'text-gray-700'}">${day}</div>
        ${dayBookings.slice(0, 2).map(b => `
          <div class="text-xs truncate mt-1 px-1 rounded ${b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">
            ${b.guestName.split(' ')[0]}
          </div>
        `).join('')}
        ${dayBookings.length > 2 ? `<div class="text-xs text-gray-500 mt-1">+${dayBookings.length - 2} more</div>` : ''}
      </div>
    `;
  }
  
  grid.innerHTML = calendarHTML;
}

window.copyIcalUrl = () => {
  const input = document.getElementById('icalUrl');
  input.select();
  document.execCommand('copy');
  alert('iCal URL copied to clipboard!');
};

// ============== BOOKINGS ==============
function renderBookings() {
  return renderCalendar();
}

// ============== ROOMS CMS ==============
function renderRoomsCMS() {
  return `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h3 class="text-xl font-bold text-gray-800">Manage Rooms</h3>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        ${rooms.map(room => `
          <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div class="relative h-48">
              <img src="${room.images[0]}" alt="${room.name.en}" class="w-full h-full object-cover">
              <div class="absolute top-4 right-4">
                <span class="px-3 py-1 bg-emerald-600 text-white rounded-full text-sm font-medium">€${room.pricePerPerson}/person</span>
              </div>
            </div>
            <div class="p-6">
              <h4 class="font-bold text-lg text-gray-800 mb-2">${room.name.en}</h4>
              <p class="text-gray-600 text-sm mb-4">${room.description.en}</p>
              
              <div class="flex flex-wrap gap-2 mb-4">
                ${room.amenities.map(a => `
                  <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">${a}</span>
                `).join('')}
              </div>
              
              <div class="flex justify-between items-center pt-4 border-t">
                <span class="text-sm text-gray-500">Capacity: ${room.capacity} persons</span>
                <button 
                  onclick="editRoom('${room.id}')"
                  class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm">
                  <i class="fas fa-edit mr-1"></i>Edit
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Temporary storage for content images during editing
let tempWellnessImages = [];
let tempGastroImages = [];

// ============== CONTENT CMS ==============
function renderContentCMS() {
  // Initialize temp images from content
  tempWellnessImages = [...(content.wellness?.images || [])];
  tempGastroImages = [...(content.gastronomy?.images || [])];
  
  return `
    <div class="space-y-6">
      <!-- Hero Section -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i class="fas fa-image text-emerald-600"></i>
          Hero Section
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Title (Albanian)</label>
            <input type="text" id="heroTitleAl" value="${content.hero?.title?.al || ''}" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Title (English)</label>
            <input type="text" id="heroTitleEn" value="${content.hero?.title?.en || ''}" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Subtitle (Albanian)</label>
            <input type="text" id="heroSubtitleAl" value="${content.hero?.subtitle?.al || ''}" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Background Image URL</label>
            <input type="text" id="heroImage" value="${content.hero?.image || ''}" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">
            ${content.hero?.image ? `<img src="${content.hero.image}" class="mt-2 h-24 object-cover rounded-lg" alt="Hero preview">` : ''}
          </div>
        </div>
        <button onclick="saveHeroContent()" class="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
          <i class="fas fa-save mr-1"></i>Save Hero
        </button>
      </div>
      
      <!-- Wellness Section -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i class="fas fa-spa text-emerald-600"></i>
          Wellness Section
        </h3>
        
        <div class="space-y-4">
          <div>
            <h4 class="font-medium text-gray-700 mb-2">Hot Baths Description (Albanian)</h4>
            <textarea id="hotBathsDescAl" rows="3" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">${content.wellness?.hotBaths?.description?.al || ''}</textarea>
          </div>
          <div>
            <h4 class="font-medium text-gray-700 mb-2">Cold Baths Description (Albanian)</h4>
            <textarea id="coldBathsDescAl" rows="3" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">${content.wellness?.coldBaths?.description?.al || ''}</textarea>
          </div>
          
          <!-- Wellness Images Management -->
          <div class="border rounded-lg p-4 bg-gray-50">
            <label class="block text-sm font-medium text-gray-700 mb-3">
              <i class="fas fa-images mr-1 text-emerald-600"></i>
              Wellness Images (<span id="wellnessImageCount">${tempWellnessImages.length}</span>)
            </label>
            
            <!-- Current Images Grid -->
            <div id="wellnessImagesGrid" class="grid grid-cols-4 gap-2 mb-3">
              ${tempWellnessImages.map((img, index) => `
                <div class="relative group">
                  <img src="${img}" alt="Wellness ${index + 1}" class="w-full h-16 object-cover rounded-lg border">
                  <button type="button" onclick="removeWellnessImage(${index})" 
                          class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition">
                    <i class="fas fa-times text-xs"></i>
                  </button>
                </div>
              `).join('')}
            </div>
            
            <!-- Add New Image -->
            <div class="flex gap-2">
              <input type="text" id="newWellnessImageUrl" placeholder="Paste image URL here..." 
                     class="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500">
              <button type="button" onclick="addWellnessImage()" 
                      class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm">
                <i class="fas fa-plus mr-1"></i>Add
              </button>
            </div>
          </div>
        </div>
        <button onclick="saveWellnessContent()" class="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
          <i class="fas fa-save mr-1"></i>Save Wellness
        </button>
      </div>
      
      <!-- Gastronomy Section -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i class="fas fa-utensils text-emerald-600"></i>
          Gastronomy Section
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description (Albanian)</label>
            <textarea id="gastroDescAl" rows="3" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">${content.gastronomy?.description?.al || ''}</textarea>
          </div>
          
          <!-- Gastronomy Images Management -->
          <div class="border rounded-lg p-4 bg-gray-50">
            <label class="block text-sm font-medium text-gray-700 mb-3">
              <i class="fas fa-images mr-1 text-emerald-600"></i>
              Food Images (<span id="gastroImageCount">${tempGastroImages.length}</span>)
            </label>
            
            <!-- Current Images Grid -->
            <div id="gastroImagesGrid" class="grid grid-cols-4 gap-2 mb-3">
              ${tempGastroImages.map((img, index) => `
                <div class="relative group">
                  <img src="${img}" alt="Food ${index + 1}" class="w-full h-16 object-cover rounded-lg border">
                  <button type="button" onclick="removeGastroImage(${index})" 
                          class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition">
                    <i class="fas fa-times text-xs"></i>
                  </button>
                </div>
              `).join('')}
            </div>
            
            <!-- Add New Image -->
            <div class="flex gap-2">
              <input type="text" id="newGastroImageUrl" placeholder="Paste image URL here..." 
                     class="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500">
              <button type="button" onclick="addGastroImage()" 
                      class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm">
                <i class="fas fa-plus mr-1"></i>Add
              </button>
            </div>
          </div>
        </div>
        <button onclick="saveGastroContent()" class="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
          <i class="fas fa-save mr-1"></i>Save Gastronomy
        </button>
      </div>
    </div>
  `;
}

// Wellness image management functions
window.addWellnessImage = () => {
  const input = document.getElementById('newWellnessImageUrl');
  const url = input.value.trim();
  if (url) {
    tempWellnessImages.push(url);
    input.value = '';
    refreshWellnessImagesGrid();
  }
};

window.removeWellnessImage = (index) => {
  tempWellnessImages.splice(index, 1);
  refreshWellnessImagesGrid();
};

function refreshWellnessImagesGrid() {
  const grid = document.getElementById('wellnessImagesGrid');
  const countEl = document.getElementById('wellnessImageCount');
  if (!grid) return;
  
  grid.innerHTML = tempWellnessImages.map((img, index) => `
    <div class="relative group">
      <img src="${img}" alt="Wellness ${index + 1}" class="w-full h-16 object-cover rounded-lg border">
      <button type="button" onclick="removeWellnessImage(${index})" 
              class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition">
        <i class="fas fa-times text-xs"></i>
      </button>
    </div>
  `).join('');
  
  if (countEl) countEl.textContent = tempWellnessImages.length;
}

// Gastronomy image management functions
window.addGastroImage = () => {
  const input = document.getElementById('newGastroImageUrl');
  const url = input.value.trim();
  if (url) {
    tempGastroImages.push(url);
    input.value = '';
    refreshGastroImagesGrid();
  }
};

window.removeGastroImage = (index) => {
  tempGastroImages.splice(index, 1);
  refreshGastroImagesGrid();
};

function refreshGastroImagesGrid() {
  const grid = document.getElementById('gastroImagesGrid');
  const countEl = document.getElementById('gastroImageCount');
  if (!grid) return;
  
  grid.innerHTML = tempGastroImages.map((img, index) => `
    <div class="relative group">
      <img src="${img}" alt="Food ${index + 1}" class="w-full h-16 object-cover rounded-lg border">
      <button type="button" onclick="removeGastroImage(${index})" 
              class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition">
        <i class="fas fa-times text-xs"></i>
      </button>
    </div>
  `).join('');
  
  if (countEl) countEl.textContent = tempGastroImages.length;
}

// ============== REVIEWS CMS ==============
function renderReviewsCMS() {
  return `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h3 class="text-xl font-bold text-gray-800">Manage Reviews</h3>
        <button 
          onclick="openReviewModal()"
          class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2">
          <i class="fas fa-plus"></i>
          Add Review
        </button>
      </div>
      
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr class="text-left text-sm text-gray-500">
              <th class="px-6 py-3 font-medium">Name</th>
              <th class="px-6 py-3 font-medium">Rating</th>
              <th class="px-6 py-3 font-medium">Review (Albanian)</th>
              <th class="px-6 py-3 font-medium">Date</th>
              <th class="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${reviews.map(review => `
              <tr class="border-t hover:bg-gray-50">
                <td class="px-6 py-4 font-medium text-gray-800">${review.name}</td>
                <td class="px-6 py-4">
                  <div class="flex text-yellow-400">
                    ${Array(review.rating).fill('<i class="fas fa-star"></i>').join('')}
                  </div>
                </td>
                <td class="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">${review.text?.al || ''}</td>
                <td class="px-6 py-4 text-gray-500 text-sm">${review.date}</td>
                <td class="px-6 py-4">
                  <button onclick="editReview('${review.id}')" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button onclick="deleteReview('${review.id}')" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ============== MODAL ==============
function renderModal() {
  return `
    <div id="modal" class="fixed inset-0 bg-black/50 z-50 hidden items-center justify-center">
      <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div id="modalContent"></div>
      </div>
    </div>
  `;
}

window.openBookingModal = (date = '') => {
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modalContent');
  
  modalContent.innerHTML = `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-gray-800">Add New Booking</h3>
        <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <form id="bookingForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
          <input type="text" name="guestName" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input type="tel" name="phone" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Room</label>
          <select name="roomId" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">
            ${rooms.map(r => `<option value="${r.id}">${r.name.en} - €${r.pricePerPerson}/person</option>`).join('')}
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
            <input type="date" name="checkIn" value="${date}" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
            <input type="date" name="checkOut" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Guests</label>
            <input type="number" name="guests" value="2" min="1" max="10" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Total Price (€)</label>
            <input type="number" name="totalPrice" min="0" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select name="status" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
          </select>
        </div>
        
        <div class="flex gap-3 pt-4">
          <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
            Cancel
          </button>
          <button type="submit" class="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
            Save Booking
          </button>
        </div>
      </form>
    </div>
  `;
  
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  
  document.getElementById('bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const booking = Object.fromEntries(formData);
    booking.guests = parseInt(booking.guests);
    booking.totalPrice = parseInt(booking.totalPrice);
    
    await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    });
    
    await fetchAllData();
    closeModal();
    renderAdmin();
  });
};

window.openReviewModal = () => {
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modalContent');
  
  modalContent.innerHTML = `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-gray-800">Add New Review</h3>
        <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <form id="reviewForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
          <input type="text" name="name" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Rating</label>
          <select name="rating" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Review (Albanian)</label>
          <textarea name="textAl" rows="3" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Review (English)</label>
          <textarea name="textEn" rows="3" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"></textarea>
        </div>
        
        <div class="flex gap-3 pt-4">
          <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
            Cancel
          </button>
          <button type="submit" class="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
            Save Review
          </button>
        </div>
      </form>
    </div>
  `;
  
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  
  document.getElementById('reviewForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const review = {
      name: formData.get('name'),
      rating: parseInt(formData.get('rating')),
      text: {
        al: formData.get('textAl'),
        en: formData.get('textEn') || formData.get('textAl')
      },
      date: new Date().toISOString().split('T')[0]
    };
    
    await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review)
    });
    
    await fetchAllData();
    closeModal();
    renderAdmin();
  });
};

window.closeModal = () => {
  const modal = document.getElementById('modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
};

// ============== API FUNCTIONS ==============
window.updateBookingStatus = async (id, status) => {
  await fetch(`/api/bookings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  await fetchAllData();
  renderAdmin();
};

window.deleteBooking = async (id) => {
  if (!confirm('Are you sure you want to delete this booking?')) return;
  await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
  await fetchAllData();
  renderAdmin();
};

window.editBooking = (id) => {
  const booking = bookings.find(b => b.id === id);
  if (!booking) return;
  
  openBookingModal(booking.checkIn);
  
  setTimeout(() => {
    const form = document.getElementById('bookingForm');
    form.querySelector('[name="guestName"]').value = booking.guestName;
    form.querySelector('[name="phone"]').value = booking.phone;
    form.querySelector('[name="roomId"]').value = booking.roomId;
    form.querySelector('[name="checkIn"]').value = booking.checkIn;
    form.querySelector('[name="checkOut"]').value = booking.checkOut;
    form.querySelector('[name="guests"]').value = booking.guests;
    form.querySelector('[name="totalPrice"]').value = booking.totalPrice;
    form.querySelector('[name="status"]').value = booking.status;
    
    form.onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const updates = Object.fromEntries(formData);
      updates.guests = parseInt(updates.guests);
      updates.totalPrice = parseInt(updates.totalPrice);
      
      await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      await fetchAllData();
      closeModal();
      renderAdmin();
    };
  }, 100);
};

// Temporary storage for room images during editing
let tempRoomImages = [];

window.editRoom = (id) => {
  const room = rooms.find(r => r.id === id);
  if (!room) return;
  
  // Initialize temp images
  tempRoomImages = [...room.images];
  
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modalContent');
  
  modalContent.innerHTML = `
    <div class="p-6 max-h-[85vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-gray-800">Edit Room</h3>
        <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <form id="roomForm" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name (Albanian)</label>
            <input type="text" name="nameAl" value="${room.name.al}" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name (English)</label>
            <input type="text" name="nameEn" value="${room.name.en}" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description (Albanian)</label>
          <textarea name="descAl" rows="2" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">${room.description.al}</textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description (English)</label>
          <textarea name="descEn" rows="2" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">${room.description.en}</textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Price per Person (€)</label>
            <input type="number" name="pricePerPerson" value="${room.pricePerPerson}" min="1" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
            <input type="number" name="capacity" value="${room.capacity}" min="1" max="10" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Amenities (comma separated)</label>
          <input type="text" name="amenities" value="${room.amenities.join(', ')}" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="wifi, tv, bathroom">
        </div>
        
        <!-- Image Management Section -->
        <div class="border rounded-lg p-4 bg-gray-50">
          <label class="block text-sm font-medium text-gray-700 mb-3">
            <i class="fas fa-images mr-1 text-emerald-600"></i>
            Room Images (${tempRoomImages.length})
          </label>
          
          <!-- Current Images Grid -->
          <div id="roomImagesGrid" class="grid grid-cols-3 gap-2 mb-3">
            ${tempRoomImages.map((img, index) => `
              <div class="relative group">
                <img src="${img}" alt="Room ${index + 1}" class="w-full h-20 object-cover rounded-lg border">
                <button type="button" onclick="removeRoomImage(${index})" 
                        class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition">
                  <i class="fas fa-times"></i>
                </button>
                <span class="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1 rounded">${index + 1}</span>
              </div>
            `).join('')}
          </div>
          
          <!-- Add New Image -->
          <div class="flex gap-2">
            <input type="text" id="newRoomImageUrl" placeholder="Paste image URL here..." 
                   class="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500">
            <button type="button" onclick="addRoomImage()" 
                    class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm">
              <i class="fas fa-plus mr-1"></i>Add
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-2"><i class="fas fa-info-circle mr-1"></i>Click the X button on images to remove them</p>
        </div>
        
        <div class="flex gap-3 pt-4">
          <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
            Cancel
          </button>
          <button type="submit" class="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
            Save Room
          </button>
        </div>
      </form>
    </div>
  `;
  
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  
  document.getElementById('roomForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const updates = {
      name: {
        ...room.name,
        al: formData.get('nameAl'),
        en: formData.get('nameEn')
      },
      description: {
        ...room.description,
        al: formData.get('descAl'),
        en: formData.get('descEn')
      },
      pricePerPerson: parseInt(formData.get('pricePerPerson')),
      capacity: parseInt(formData.get('capacity')),
      amenities: formData.get('amenities').split(',').map(a => a.trim()).filter(a => a),
      images: tempRoomImages
    };
    
    await fetch(`/api/rooms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    
    await fetchAllData();
    closeModal();
    renderAdmin();
  });
};

// Room image management functions
window.addRoomImage = () => {
  const input = document.getElementById('newRoomImageUrl');
  const url = input.value.trim();
  if (url) {
    tempRoomImages.push(url);
    input.value = '';
    refreshRoomImagesGrid();
  }
};

window.removeRoomImage = (index) => {
  tempRoomImages.splice(index, 1);
  refreshRoomImagesGrid();
};

function refreshRoomImagesGrid() {
  const grid = document.getElementById('roomImagesGrid');
  if (!grid) return;
  
  grid.innerHTML = tempRoomImages.map((img, index) => `
    <div class="relative group">
      <img src="${img}" alt="Room ${index + 1}" class="w-full h-20 object-cover rounded-lg border">
      <button type="button" onclick="removeRoomImage(${index})" 
              class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition">
        <i class="fas fa-times"></i>
      </button>
      <span class="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1 rounded">${index + 1}</span>
    </div>
  `).join('');
  
  // Update the count label
  const label = grid.parentElement.querySelector('label');
  if (label) {
    label.innerHTML = `<i class="fas fa-images mr-1 text-emerald-600"></i> Room Images (${tempRoomImages.length})`;
  }
}

window.editReview = (id) => {
  const review = reviews.find(r => r.id === id);
  if (!review) return;
  
  openReviewModal();
  
  setTimeout(() => {
    const form = document.getElementById('reviewForm');
    form.querySelector('[name="name"]').value = review.name;
    form.querySelector('[name="rating"]').value = review.rating;
    form.querySelector('[name="textAl"]').value = review.text?.al || '';
    form.querySelector('[name="textEn"]').value = review.text?.en || '';
    
    form.onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const updates = {
        name: formData.get('name'),
        rating: parseInt(formData.get('rating')),
        text: {
          al: formData.get('textAl'),
          en: formData.get('textEn') || formData.get('textAl')
        }
      };
      
      await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      await fetchAllData();
      closeModal();
      renderAdmin();
    };
  }, 100);
};

window.deleteReview = async (id) => {
  if (!confirm('Are you sure you want to delete this review?')) return;
  await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
  await fetchAllData();
  renderAdmin();
};

// Content save functions
window.saveHeroContent = async () => {
  const updates = {
    hero: {
      ...content.hero,
      title: {
        ...content.hero?.title,
        al: document.getElementById('heroTitleAl').value,
        en: document.getElementById('heroTitleEn').value
      },
      subtitle: {
        ...content.hero?.subtitle,
        al: document.getElementById('heroSubtitleAl').value
      },
      image: document.getElementById('heroImage').value
    }
  };
  
  await fetch('/api/content', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  
  alert('Hero content saved!');
  await fetchAllData();
};

window.saveWellnessContent = async () => {
  const updates = {
    wellness: {
      ...content.wellness,
      hotBaths: {
        ...content.wellness?.hotBaths,
        description: {
          ...content.wellness?.hotBaths?.description,
          al: document.getElementById('hotBathsDescAl').value
        }
      },
      coldBaths: {
        ...content.wellness?.coldBaths,
        description: {
          ...content.wellness?.coldBaths?.description,
          al: document.getElementById('coldBathsDescAl').value
        }
      },
      images: tempWellnessImages
    }
  };
  
  await fetch('/api/content', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  
  alert('Wellness content saved!');
  await fetchAllData();
};

window.saveGastroContent = async () => {
  const updates = {
    gastronomy: {
      ...content.gastronomy,
      description: {
        ...content.gastronomy?.description,
        al: document.getElementById('gastroDescAl').value
      },
      images: tempGastroImages
    }
  };
  
  await fetch('/api/content', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  
  alert('Gastronomy content saved!');
  await fetchAllData();
};

// Navigation
window.setView = (view) => {
  currentView = view;
  renderAdmin();
};

window.logout = () => {
  localStorage.removeItem('adminToken');
  window.location.href = '/login';
};

// ============== BLOG CMS ==============
function renderBlogCMS() {
  let postsHTML = '';
  posts.forEach(post => {
    const imageCell = post.image 
      ? '<img src="' + post.image + '" alt="' + (post.title?.al || '') + '" class="w-16 h-12 object-cover rounded-lg">'
      : '<div class="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400"><i class="fas fa-image"></i></div>';
    
    postsHTML += '<tr class="border-t hover:bg-gray-50">' +
      '<td class="px-6 py-4">' + imageCell + '</td>' +
      '<td class="px-6 py-4"><div><p class="font-medium text-gray-800">' + (post.title?.al || 'Untitled') + '</p>' +
      '<p class="text-sm text-gray-500 truncate max-w-xs">' + (post.excerpt?.al || '') + '</p></div></td>' +
      '<td class="px-6 py-4 text-gray-600 text-sm font-mono">' + (post.slug || '') + '</td>' +
      '<td class="px-6 py-4 text-gray-500 text-sm">' + (post.date || '') + '</td>' +
      '<td class="px-6 py-4">' +
        '<a href="/blog/' + post.slug + '" target="_blank" class="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition inline-block" title="View"><i class="fas fa-external-link-alt"></i></a>' +
        '<button onclick="editPost(\'' + post.id + '\')" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit"><i class="fas fa-edit"></i></button>' +
        '<button onclick="deletePost(\'' + post.id + '\')" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete"><i class="fas fa-trash"></i></button>' +
      '</td></tr>';
  });
  
  const emptyState = posts.length === 0 
    ? '<div class="p-8 text-center text-gray-500"><i class="fas fa-newspaper text-4xl mb-3 text-gray-300"></i><p>No blog posts yet. Click "New Post" to create one.</p></div>' 
    : '';
  
  return '<div class="space-y-6">' +
    '<div class="flex justify-between items-center">' +
      '<h3 class="text-xl font-bold text-gray-800">Blog Manager</h3>' +
      '<button onclick="openPostModal()" class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2">' +
        '<i class="fas fa-plus"></i> New Post</button>' +
    '</div>' +
    '<div class="bg-white rounded-xl shadow-sm overflow-hidden">' +
      '<table class="w-full"><thead class="bg-gray-50"><tr class="text-left text-sm text-gray-500">' +
        '<th class="px-6 py-3 font-medium">Image</th>' +
        '<th class="px-6 py-3 font-medium">Title</th>' +
        '<th class="px-6 py-3 font-medium">Slug</th>' +
        '<th class="px-6 py-3 font-medium">Date</th>' +
        '<th class="px-6 py-3 font-medium">Actions</th>' +
      '</tr></thead><tbody>' + postsHTML + '</tbody></table>' + emptyState +
    '</div></div>';
}

window.openPostModal = (postData = null) => {
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modalContent');
  const isEdit = postData !== null;
  const titleText = isEdit ? 'Edit' : 'Create New';
  const btnText = isEdit ? 'Update' : 'Create';
  const imagePreview = postData?.image ? '<img src="' + postData.image + '" class="mt-2 h-20 object-cover rounded-lg" alt="Preview">' : '';
  
  modalContent.innerHTML = '<div class="p-6 max-h-[85vh] overflow-y-auto">' +
    '<div class="flex justify-between items-center mb-6">' +
      '<h3 class="text-xl font-bold text-gray-800">' + titleText + ' Blog Post</h3>' +
      '<button onclick="closeModal()" class="text-gray-500 hover:text-gray-700"><i class="fas fa-times text-xl"></i></button>' +
    '</div>' +
    '<form id="postForm" class="space-y-4">' +
      '<div><label class="block text-sm font-medium text-gray-700 mb-1">Title (Albanian) *</label>' +
        '<input type="text" name="titleAl" value="' + (postData?.title?.al || '') + '" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"></div>' +
      '<div><label class="block text-sm font-medium text-gray-700 mb-1">Title (English)</label>' +
        '<input type="text" name="titleEn" value="' + (postData?.title?.en || '') + '" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"></div>' +
      '<div><label class="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>' +
        '<input type="text" name="slug" value="' + (postData?.slug || '') + '" placeholder="auto-generated if empty" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono text-sm"></div>' +
      '<div><label class="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>' +
        '<input type="text" name="image" value="' + (postData?.image || '') + '" placeholder="https://images.unsplash.com/..." class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">' + imagePreview + '</div>' +
      '<div><label class="block text-sm font-medium text-gray-700 mb-1">Excerpt (Albanian) *</label>' +
        '<textarea name="excerptAl" rows="2" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">' + (postData?.excerpt?.al || '') + '</textarea></div>' +
      '<div><label class="block text-sm font-medium text-gray-700 mb-1">Full Content (Albanian - HTML) *</label>' +
        '<textarea name="contentAl" rows="6" required placeholder="<p>Your content here...</p>" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono text-sm">' + (postData?.content?.al || '') + '</textarea>' +
        '<p class="text-xs text-gray-500 mt-1">Supports HTML tags: &lt;p&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;</p></div>' +
      '<div><label class="block text-sm font-medium text-gray-700 mb-1">Full Content (English - HTML)</label>' +
        '<textarea name="contentEn" rows="4" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono text-sm">' + (postData?.content?.en || '') + '</textarea></div>' +
      '<div><label class="block text-sm font-medium text-gray-700 mb-1">Date</label>' +
        '<input type="date" name="date" value="' + (postData?.date || new Date().toISOString().split('T')[0]) + '" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"></div>' +
      '<div class="flex gap-3 pt-4">' +
        '<button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">Cancel</button>' +
        '<button type="submit" class="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">' + btnText + ' Post</button>' +
      '</div>' +
    '</form></div>';
  
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  
  document.getElementById('postForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const post = {
      title: { al: formData.get('titleAl'), en: formData.get('titleEn') || formData.get('titleAl') },
      slug: formData.get('slug'),
      image: formData.get('image') || '',
      excerpt: { al: formData.get('excerptAl'), en: formData.get('excerptAl') },
      content: { al: formData.get('contentAl'), en: formData.get('contentEn') || formData.get('contentAl') },
      date: formData.get('date')
    };
    
    const url = isEdit ? '/api/posts/' + postData.id : '/api/posts';
    const method = isEdit ? 'PUT' : 'POST';
    
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(post) });
    await fetchAllData();
    closeModal();
    renderAdmin();
  });
};

window.editPost = (id) => {
  const post = posts.find(p => p.id === id);
  if (post) openPostModal(post);
};

window.deletePost = async (id) => {
  if (!confirm('Are you sure you want to delete this blog post?')) return;
  await fetch('/api/posts/' + id, { method: 'DELETE' });
  await fetchAllData();
  renderAdmin();
};

// ============== FINANCE MODULE ==============
function renderFinance() {
  const profitClass = financeStats.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600';
  const profitIcon = financeStats.netProfit >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
  const profitBg = financeStats.netProfit >= 0 ? 'bg-emerald-100' : 'bg-red-100';
  const profitText = financeStats.netProfit >= 0 ? 'Fitim' : 'Humbje';
  
  // Year selector options
  const yearOptions = ['2025', '2026', '2027'].map(y => 
    '<option value="' + y + '"' + (selectedYear === y ? ' selected' : '') + '>' + y + '</option>'
  ).join('');
  
  // Finance records table rows
  let recordsHTML = '';
  financeRecords.forEach(record => {
    recordsHTML += '<tr class="border-t hover:bg-gray-50">' +
      '<td class="px-6 py-4 text-gray-600 text-sm">' + record.date + '</td>' +
      '<td class="px-6 py-4"><span class="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">' + record.category + '</span></td>' +
      '<td class="px-6 py-4 text-gray-800">' + record.description + '</td>' +
      '<td class="px-6 py-4 text-right font-medium text-red-600">€' + record.amount + '</td>' +
      '<td class="px-6 py-4">' +
        '<button onclick="editExpense(\'' + record.id + '\')" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><i class="fas fa-edit"></i></button>' +
        '<button onclick="deleteExpense(\'' + record.id + '\')" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><i class="fas fa-trash"></i></button>' +
      '</td></tr>';
  });
  
  const emptyState = financeRecords.length === 0 
    ? '<div class="p-8 text-center text-gray-500"><i class="fas fa-receipt text-4xl mb-3 text-gray-300"></i><p>Nuk ka shpenzime për vitin ' + selectedYear + '.</p></div>' 
    : '';
  
  return '<div class="space-y-6">' +
    // Year Filter Header
    '<div class="bg-white rounded-xl shadow-sm p-6">' +
      '<div class="flex items-center justify-between flex-wrap gap-4">' +
        '<h3 class="text-xl font-bold text-gray-800 flex items-center gap-2"><i class="fas fa-coins text-emerald-600"></i> Sistemi Financiar</h3>' +
        '<div class="flex items-center gap-4">' +
          '<label class="text-sm text-gray-600">Viti:</label>' +
          '<select onchange="changeYear(this.value)" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500">' + yearOptions + '</select>' +
          '<button onclick="openExpenseModal()" class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"><i class="fas fa-plus"></i> Shto Shpenzim</button>' +
        '</div></div></div>' +
    // KPI Cards
    '<div class="grid grid-cols-1 md:grid-cols-3 gap-6">' +
      // Revenue Card
      '<div class="bg-white rounded-xl p-6 shadow-sm">' +
        '<div class="flex items-center justify-between">' +
          '<div><p class="text-sm text-gray-500">Të Ardhurat (Revenue)</p><p class="text-2xl font-bold text-emerald-600">€' + (financeStats.totalRevenue || 0) + '</p></div>' +
          '<div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center"><i class="fas fa-hand-holding-usd text-emerald-600 text-xl"></i></div>' +
        '</div><p class="text-xs text-gray-500 mt-2">Nga rezervimet e konfirmuara</p></div>' +
      // Expenses Card
      '<div class="bg-white rounded-xl p-6 shadow-sm">' +
        '<div class="flex items-center justify-between">' +
          '<div><p class="text-sm text-gray-500">Shpenzimet (Expenses)</p><p class="text-2xl font-bold text-red-600">€' + (financeStats.totalExpenses || 0) + '</p></div>' +
          '<div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center"><i class="fas fa-credit-card text-red-600 text-xl"></i></div>' +
        '</div><p class="text-xs text-gray-500 mt-2">Total shpenzimet për vitin ' + selectedYear + '</p></div>' +
      // Net Profit Card
      '<div class="bg-white rounded-xl p-6 shadow-sm">' +
        '<div class="flex items-center justify-between">' +
          '<div><p class="text-sm text-gray-500">Fitimi Neto (Net Profit)</p><p class="text-2xl font-bold ' + profitClass + '">€' + (financeStats.netProfit || 0) + '</p></div>' +
          '<div class="w-12 h-12 ' + profitBg + ' rounded-lg flex items-center justify-center"><i class="fas ' + profitIcon + ' ' + profitClass + ' text-xl"></i></div>' +
        '</div><p class="text-xs ' + profitClass + ' mt-2"><i class="fas ' + profitIcon + ' mr-1"></i>' + profitText + '</p></div>' +
    '</div>' +
    // Charts
    '<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">' +
      '<div class="bg-white rounded-xl p-6 shadow-sm"><h3 class="font-bold text-gray-800 mb-4">Shpenzimet sipas Kategorisë</h3><div class="h-64"><canvas id="expensePieChart"></canvas></div></div>' +
      '<div class="bg-white rounded-xl p-6 shadow-sm"><h3 class="font-bold text-gray-800 mb-4">Fitimi/Humbja Mujore</h3><div class="h-64"><canvas id="profitLossChart"></canvas></div></div>' +
    '</div>' +
    // Records Table
    '<div class="bg-white rounded-xl shadow-sm overflow-hidden">' +
      '<div class="p-6 border-b"><h3 class="font-bold text-gray-800">Regjistri i Shpenzimeve</h3></div>' +
      '<table class="w-full"><thead class="bg-gray-50"><tr class="text-left text-sm text-gray-500">' +
        '<th class="px-6 py-3 font-medium">Data</th>' +
        '<th class="px-6 py-3 font-medium">Kategoria</th>' +
        '<th class="px-6 py-3 font-medium">Përshkrimi</th>' +
        '<th class="px-6 py-3 font-medium text-right">Shuma</th>' +
        '<th class="px-6 py-3 font-medium">Veprime</th>' +
      '</tr></thead><tbody>' + recordsHTML + '</tbody></table>' + emptyState +
    '</div></div>';
}

function initFinanceCharts() {
  // Expense Pie Chart
  const pieCtx = document.getElementById('expensePieChart');
  if (pieCtx && financeStats.expensesByCategory) {
    if (expensePieChart) expensePieChart.destroy();
    
    const categories = Object.keys(financeStats.expensesByCategory);
    const values = Object.values(financeStats.expensesByCategory);
    const colors = [
      'rgba(239, 68, 68, 0.8)',   // red
      'rgba(249, 115, 22, 0.8)', // orange
      'rgba(234, 179, 8, 0.8)',  // yellow
      'rgba(34, 197, 94, 0.8)',  // green
      'rgba(59, 130, 246, 0.8)', // blue
      'rgba(139, 92, 246, 0.8)', // purple
      'rgba(236, 72, 153, 0.8)', // pink
      'rgba(20, 184, 166, 0.8)', // teal
      'rgba(107, 114, 128, 0.8)', // gray
      'rgba(168, 85, 247, 0.8)'  // violet
    ];
    
    expensePieChart = new Chart(pieCtx, {
      type: 'doughnut',
      data: {
        labels: categories,
        datasets: [{
          data: values,
          backgroundColor: colors.slice(0, categories.length),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { boxWidth: 12, font: { size: 10 } }
          }
        }
      }
    });
  }
  
  // Monthly Profit/Loss Bar Chart
  const barCtx = document.getElementById('profitLossChart');
  if (barCtx && financeStats.monthlyData) {
    if (profitLossChart) profitLossChart.destroy();
    
    const months = Object.keys(financeStats.monthlyData);
    const profits = months.map(m => {
      const data = financeStats.monthlyData[m];
      return data.revenue - data.expenses;
    });
    
    const backgroundColors = profits.map(p => p >= 0 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)');
    const borderColors = profits.map(p => p >= 0 ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)');
    
    profitLossChart = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: 'Fitimi/Humbja (€)',
          data: profits,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }
}

window.changeYear = async (year) => {
  selectedYear = year;
  await fetchAllData();
  renderAdmin();
};

window.openExpenseModal = (expenseData = null) => {
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modalContent');
  const isEdit = expenseData !== null;
  const titleText = isEdit ? 'Edito' : 'Shto';
  const btnText = isEdit ? 'Ruaj' : 'Shto';
  
  // Build category options
  let categoryOptions = '';
  expenseCategories.forEach(cat => {
    const selected = expenseData?.category === cat ? ' selected' : '';
    categoryOptions += '<option value="' + cat + '"' + selected + '>' + cat + '</option>';
  });
  
  modalContent.innerHTML = '<div class="p-6">' +
    '<div class="flex justify-between items-center mb-6">' +
      '<h3 class="text-xl font-bold text-gray-800">' + titleText + ' Shpenzim</h3>' +
      '<button onclick="closeModal()" class="text-gray-500 hover:text-gray-700"><i class="fas fa-times text-xl"></i></button>' +
    '</div>' +
    '<form id="expenseForm" class="space-y-4">' +
      '<div><label class="block text-sm font-medium text-gray-700 mb-1">Data</label>' +
        '<input type="date" name="date" value="' + (expenseData?.date || new Date().toISOString().split('T')[0]) + '" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"></div>' +
      '<div><label class="block text-sm font-medium text-gray-700 mb-1">Kategoria</label>' +
        '<select name="category" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">' + categoryOptions + '</select></div>' +
      '<div><label class="block text-sm font-medium text-gray-700 mb-1">Shuma (€)</label>' +
        '<input type="number" name="amount" value="' + (expenseData?.amount || '') + '" min="0" step="0.01" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"></div>' +
      '<div><label class="block text-sm font-medium text-gray-700 mb-1">Përshkrimi</label>' +
        '<input type="text" name="description" value="' + (expenseData?.description || '') + '" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"></div>' +
      '<div class="flex gap-3 pt-4">' +
        '<button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">Anulo</button>' +
        '<button type="submit" class="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">' + btnText + '</button>' +
      '</div>' +
    '</form></div>';
  
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  
  document.getElementById('expenseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const expense = {
      date: formData.get('date'),
      category: formData.get('category'),
      amount: parseFloat(formData.get('amount')),
      description: formData.get('description')
    };
    
    const url = isEdit ? '/api/finance/' + expenseData.id : '/api/finance';
    const method = isEdit ? 'PUT' : 'POST';
    
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(expense) });
    await fetchAllData();
    closeModal();
    renderAdmin();
  });
};

window.editExpense = (id) => {
  const expense = financeRecords.find(f => f.id === id);
  if (expense) openExpenseModal(expense);
};

window.deleteExpense = async (id) => {
  if (!confirm('Jeni i sigurt që doni të fshini këtë shpenzim?')) return;
  await fetch('/api/finance/' + id, { method: 'DELETE' });
  await fetchAllData();
  renderAdmin();
};

// ============== INITIALIZE ==============
async function init() {
  await verifyAuth();
  await fetchAllData();
  renderAdmin();
}

init();
