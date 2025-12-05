<?php
session_start();
ob_start();

require_once __DIR__ . '/../config/database.php';

// Session validation
if (
    !isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true ||
    !isset($_SESSION["user_id"])
) {
    session_destroy();
    header("Location: ../auth/login.php");
    exit;
}

// Assign session data with fallback
$user_id = $_SESSION["user_id"];
$username = $_SESSION["username"] ?? 'User';

// Get full_name from session, or fetch from database if not in session
$full_name = $_SESSION["full_name"] ?? null;
if (empty($full_name)) {
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("SELECT full_name FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $full_name = $stmt->fetchColumn();
    } catch (Exception $e) {
        error_log("Error fetching full_name: " . $e->getMessage());
    }
}
// Final fallback to username if full_name is still empty
$full_name = $full_name ?? $username;
$profile_image = $_SESSION["profile_image"] ?? '';
// Format profile image path for display
if (!empty($profile_image)) {
    // If path doesn't start with ../, add it (for pages/ directory)
    if (substr($profile_image, 0, 3) !== '../' && substr($profile_image, 0, 4) !== 'http') {
        $profile_image = '../' . $profile_image;
    }
} else {
    $profile_image = '../assets/images/wh.jpg';
}

// Date info
$date = date("l, F j, Y");
$time = date("h:i A");

// Initialize dashboard metrics
$total_animals = 0;
$health_alerts = 0;
$todays_feedings = 0;
$monthly_cost = 0;

try {
    $pdo = getDBConnection();
    if (!$pdo) throw new Exception("Database connection failed");

    // Total animals
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM animals WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $total_animals = (int) $stmt->fetchColumn();

    // Health alerts
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM health_records WHERE user_id = ? AND status = 'Alert'");
    $stmt->execute([$user_id]);
    $health_alerts = (int) $stmt->fetchColumn();

    // Today's feedings
    $today = date('Y-m-d');
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM feeding_records WHERE user_id = ? AND date = ?");
    $stmt->execute([$user_id, $today]);
    $todays_feedings = (int) $stmt->fetchColumn();

    // Monthly cost
    $current_month = date('Y-m');
    $stmt = $pdo->prepare("SELECT SUM(cost) FROM feeding_records WHERE user_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?");
    $stmt->execute([$user_id, $current_month]);
    $monthly_cost = (float) $stmt->fetchColumn();

} catch (PDOException $e) {
    error_log("PDO error [User ID $user_id]: " . $e->getMessage());
} catch (Exception $e) {
    error_log("General error [User ID $user_id]: " . $e->getMessage());
}

// Final clean-up of full name
$full_name = htmlspecialchars(ucwords(trim($full_name)));
if (empty($full_name)) {
    $full_name = htmlspecialchars(ucwords($username));
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Apna Livestock Management System - Dashboard</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- External Libraries -->
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
  <!-- Your CSS -->
  <link rel="stylesheet" href="../assets/css/style.css">
</head>

<body class="w-full h-full overflow-x-hidden">
<div id="app-wrap" class="w-full h-full min-h-screen">

  <nav id="dashboardMenu" class="dashboard-menu menu-panel fixed left-0 top-0 z-40 w-60 h-full py-10 px-3 flex flex-col gap-3 glass transition-all fade-in" style="transition:left .38s cubic-bezier(.31,1.8,.47,1)">
    <div class="flex flex-col items-center mb-8">
      <span class="text-2xl text-blue-700 font-bold tracking-tight mb-1 flex items-center gap-2"><i class="fas fa-cow text-blue-400"></i> Apna Livestock</span>
      <span class="text-sm text-blue-500 px-2 font-semibold">Management System</span>
    </div>
    <ul class="flex-1 w-full">
      <li><button class="w-full text-left py-2 px-4 rounded-md hover:bg-blue-100 flex items-center gap-2 transition-all nav-btn active-tab" data-tab="dashboard"><i class="fa fa-home"></i> Dashboard</button></li>
      <li><button class="w-full text-left py-2 px-4 rounded-md hover:bg-blue-100 flex items-center gap-2 transition-all nav-btn" data-tab="inventory"><i class="fa fa-paw"></i> Animal Inventory</button></li>
      <li><button class="w-full text-left py-2 px-4 rounded-md hover:bg-blue-100 flex items-center gap-2 transition-all nav-btn" data-tab="health"><i class="fa fa-notes-medical"></i> Health Records</button></li>
      <li><button class="w-full text-left py-2 px-4 rounded-md hover:bg-blue-100 flex items-center gap-2 transition-all nav-btn" data-tab="feeding"><i class="fa fa-bone"></i> Feeding Costs</button></li>
      <li><button class="w-full text-left py-2 px-4 rounded-md hover:bg-blue-100 flex items-center gap-2 transition-all nav-btn" data-tab="report"><i class="fa fa-chart-pie"></i> Reports</button></li>
      <li><button class="w-full text-left py-2 px-4 rounded-md hover:bg-blue-100 flex items-center gap-2 transition-all nav-btn" data-tab="settings"><i class="fa fa-gear"></i> Settings</button></li>
    </ul>

    <hr class="mb-3 border-blue-100">
   <a href="../auth/logout.php" class="w-full py-2 px-4 rounded-md text-left hover:bg-red-100 text-red-600 flex items-center gap-2 font-bold text-base transition-all">
  <i class="fa fa-sign-out-alt"></i> Logout
</a>


    <div class="mt-6 text-xs text-blue-400 text-center select-none">
      <div>© 2025 Apna Livestock</div>
      <div>All Rights Reserved</div>
    </div>
  </nav>

  <main class="transition-all fade-in" style="min-height:100vh;">
    <div class="w-full flex min-h-screen relative">
      <!-- SPACE for nav on desktop -->
      <div class="hidden md:block" style="width:15rem; flex:0 0 15rem;"></div>
      <div class="flex-1 flex flex-col w-full transition-all">
        <!-- KEY: Menu Toggle Button displayed on all tabs at fixed position for <900px -->
        <button id="openMenuBtn2" class="dashboard-fixed-btn md:hidden" style="display:none; top:17px; left:18px;"><i class="fa fa-bars"></i></button>

        <!-- DASHBOARD PAGE -->
        <section id="dashboard" class="tab-content active fade-in w-full">
          <div class="w-full flex flex-col px-3 pt-7 pb-3 max-w-7xl mx-auto relative">
            <!-- Mobile Toggle Btn for easy menu access, on every key page -->
            <button id="dashboardMenuBtn" class="dashboard-fixed-btn md:hidden" style="top:23px; left:19px; z-index:45;"><i class="fa fa-bars"></i></button>
            <div class="flex flex-col md:flex-row md:justify-between items-center gap-y-2 w-full">
              <div>
                <div class="text-2xl md:text-3xl font-bold text-blue-700 mb-1 flex gap-2 items-center">
                  <i class="fa fa-home"></i> Dashboard
                </div>
                <div class="text-base text-blue-500 mb-3" id="welcomeMsg">
                  Welcome back, <?php echo $full_name; ?>! Let's manage your livestock today.
                </div>
              </div>
              <div class="flex gap-4 items-center mt-2 md:mt-0">
                <span class="flex flex-col text-right">
                  <span class="text-blue-400 text-sm"><i class="fa fa-calendar-day mr-1"></i> <span id="todayDateDash"><?php echo $date; ?></span></span>
                  <span class="text-blue-400 text-sm"><i class="fa fa-clock mr-1"></i> <span id="nowTimeDash"><?php echo $time; ?></span></span>
                </span>
                <img id="profileImageDash" src="<?php echo htmlspecialchars($profile_image); ?>" alt="profile" class="profile-img border border-blue-100" onerror="this.src='../assets/images/wh.jpg'"/>
              </div>
            </div>
            
            <!-- FIXED: Dashboard Cards with proper closing tags -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mt-9">
              <div class="glass glass-card p-6 flex flex-col items-start">
                <div class="text-xl font-semibold flex items-center gap-2 mb-1.5"><i class="fa fa-paw text-blue-400"></i> Total Animals</div>
                <div class="text-4xl font-bold" id="dashboardAnimals"><?php echo $total_animals; ?></div>
              </div>
              <div class="glass glass-card p-6 flex flex-col items-start">
                <div class="text-xl font-semibold flex items-center gap-2 mb-1.5"><i class="fa fa-exclamation-triangle text-red-400"></i> Health Alerts</div>
                <div class="text-4xl font-bold" id="dashboardAlerts"><?php echo $health_alerts; ?></div>
              </div>
              <div class="glass glass-card p-6 flex flex-col items-start">
                <div class="text-xl font-semibold flex items-center gap-2 mb-1.5"><i class="fa fa-seedling text-green-400"></i> Today's Feedings</div>
                <div class="text-4xl font-bold" id="dashboardFeeds"><?php echo $todays_feedings; ?></div>
              </div>
              <div class="glass glass-card p-6 flex flex-col items-start">
                <div class="text-xl font-semibold flex items-center gap-2 mb-1.5"><i class="fa fa-rupee-sign text-yellow-400"></i> Month Cost</div>
                <div class="text-4xl font-bold" id="dashboardCost">₹<?php echo number_format($monthly_cost, 0); ?></div>
              </div>
            </div>
            
            <div class="mt-12 grid md:grid-cols-2 gap-9">
              <div class="glass glass-card pb-7">
                <div class="section-title text-purple-700 flex items-center gap-2 mt-4 mb-2">
                  <i class="fa fa-chart-pie"></i> Animal Distribution
                </div>
                <div class="flex justify-center">
                  <canvas id="distributionChart" style="max-width: 340px; max-height: 340px;" aria-label="Animal Species Distribution"></canvas>
                </div>
              </div>
              <div class="glass glass-card pb-8">
                <div class="section-title text-yellow-700 flex items-center gap-2 mt-4 mb-2">
                  <i class="fa fa-receipt"></i> This Month Summary
                </div>
                <div id="monthlySummary" class="mt-3 px-1 text-base"></div>
                <div class="flex gap-7 items-center mt-5">
                  <div class="flex flex-col items-center">
                    <div class="rounded-full bg-green-100 w-12 h-12 flex items-center justify-center text-green-500 text-xl">
                      <i class="fa fa-seedling"></i>
                    </div>
                    <span class="text-sm font-bold mt-1">Feeds</span>
                    <span id="summaryFeeds" class="font-mono text-lg"></span>
                  </div>
                  <div class="flex flex-col items-center">
                    <div class="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center text-blue-500 text-xl">
                      <i class="fa fa-stethoscope"></i>
                    </div>
                    <span class="text-sm font-bold mt-1">Health</span>
                    <span id="summaryHealth" class="font-mono text-lg"></span>
                  </div>
                  <div class="flex flex-col items-center">
                    <div class="rounded-full bg-yellow-100 w-12 h-12 flex items-center justify-center text-yellow-400 text-xl">
                      <i class="fa fa-rupee-sign"></i>
                    </div>
                    <span class="text-sm font-bold mt-1">Cost</span>
                    <span id="summaryCost" class="font-mono text-lg"></span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mt-14 fade-in">
              <div class="section-title flex gap-2 items-center text-indigo-700 mb-4">
                <i class="fa fa-clock"></i> Recent Activities
              </div>
              <div class="glass glass-card shadow p-6 rounded-2xl no-scrollbar">
                <ol id="activityTimeline" class="relative border-l-4 border-blue-100 ml-1">
                  <!-- Activity entries (JS) -->
                </ol>
              </div>
            </div>

            <!-- --------- New Info Boxes (Below Recent Activities) --------- -->
            <div class="mt-12 grid md:grid-cols-2 gap-7 mb-6">
              <!-- About Livestock Management -->
              <div class="info-card p-7 flex flex-col md:flex-row gap-6">
                <div>
                  <div class="text-blue-800 text-xl font-bold flex items-center gap-2 mb-2">
                    <i class="fa fa-leaf text-green-400"></i> About Livestock Management
                  </div>
                  <div class="text-base leading-relaxed mb-1 text-blue-700">
                    Livestock management is the science of overseeing and optimizing the health, feeding, and productivity of farm animals. 
                    Effective management improves animal welfare, prevents disease, and ensures sustainable farming for families and businesses alike.
                  </div>
                  <div class="mt-2 text-blue-500 text-sm italic">
                    "Healthy livestock, prosperous farms."
                  </div>
                </div>
              </div>
              <!-- About Our Website -->
              <div class="info-card p-7 flex flex-col md:flex-row gap-6">
                <div>
                  <div class="text-yellow-700 text-xl font-bold flex items-center gap-2 mb-2">
                    <i class="fa fa-globe-asia text-yellow-400"></i> About Our Website
                  </div>
                  <div class="text-base leading-relaxed mb-1 text-blue-700">
                    Apna Livestock Management System simplifies daily farm operations by providing an intuitive dashboard, animal records, health alerts, feeding logs, and data-driven insights—all in one place.
                  </div>
                  <ul class="list-disc ml-6 mt-2 text-blue-600 text-sm">
                    <li>Track every animal and its health</li>
                    <li>Automate monthly cost summaries</li>
                    <li>Collaboration-ready and mobile friendly</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div class="mb-6 grid md:grid-cols-2 gap-7">
              <!-- Meet the Owner -->
              <div class="info-card p-7">
                <div class="text-purple-800 text-xl font-bold flex items-center gap-2 mb-3">
                  <i class="fa fa-user text-purple-500"></i> Meet the Owner
                </div>
                <div class="flex items-center gap-4">
                  <!-- Owner -->
                  <div class="flex items-center gap-3">
                    <img src="../assets/images/uploads/Admin.jpg" class="owner-avatar" alt="Owner Aman" onerror="this.src='../assets/images/wh.jpg'">
                    <div>
                      <div class="font-bold text-blue-700">Aman</div>
                      <div class="text-xs text-blue-400">Owner & Operator</div>
                      <div class="text-xs text-gray-500">amanara13579@gmail.com</div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Quick Info & Community -->
              <div class="info-card p-7">
                <div class="text-indigo-800 text-xl font-bold flex items-center gap-2 mb-3">
                  <i class="fa fa-bullhorn text-indigo-400"></i> Did You Know?
                </div>
                <div class="text-blue-700 text-base mb-2">
                  Our platform helps manage over <span class="font-bold text-indigo-700">100+ farms</span> in India—bringing smart farming tools to rural communities and revolutionizing livestock tracking.
                </div>
                <div class="mt-2 border-l-4 border-indigo-200 pl-2 italic text-blue-400 text-sm">
                  Join our growing community for farm tips and updates! 
                  <a href="mailto:info@apnalivestock.com" class="underline hover:text-indigo-600">info@apnalivestock.com</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ANIMAL INVENTORY PAGE -->
        <section id="inventory" class="tab-content fade-in w-full relative">
          <!-- Mobile Toggle Btn for easy menu access, on every key page -->
          <button id="inventoryMenuBtn" class="dashboard-fixed-btn md:hidden" style="top:23px; left:19px; z-index:45;"><i class="fa fa-bars"></i></button>
          <div class="section-title flex items-center text-blue-700 mt-3 px-3"><i class="fa fa-paw mr-3"></i> Animal Inventory</div>
          <div class="glass glass-card p-3 md:p-6 mx-3">
            <div class="flex mb-3">
              <button class="ml-auto px-4 py-1 rounded-full text-white bg-blue-500 font-medium hover:bg-blue-700 transition-all shadow" onclick="openAnimalModal()">
                <i class="fa fa-plus mr-2"></i> Add Animal
              </button>
            </div>
            <div class="relative overflow-x-auto no-scrollbar shadow rounded-xl">
              <table class="min-w-full text-sm text-left table-auto">
                <thead>
                  <tr class="bg-gradient-to-r from-blue-100 via-blue-50 to-blue-200">
                    <th class="py-2 px-3 font-bold">#ID</th>
                    <th class="py-2 px-3 font-bold">Type</th>
                    <th class="py-2 px-3 font-bold">Breed</th>
                    <th class="py-2 px-3 font-bold">Age</th>
                    <th class="py-2 px-3 font-bold">Status</th>
                    <th class="py-2 px-3 font-bold">Image</th>
                    <th class="py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody id="inventoryTableBody" class="bg-white">
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- HEALTH RECORDS PAGE -->
        <section id="health" class="tab-content fade-in w-full relative">
          <button id="healthMenuBtn" class="dashboard-fixed-btn md:hidden" style="top:23px; left:19px; z-index:45;"><i class="fa fa-bars"></i></button>
          <div class="section-title flex items-center text-pink-700 mt-3 px-3"><i class="fa fa-notes-medical mr-3"></i> Health Records</div>
          <div class="glass glass-card p-3 md:p-6 mx-3">
            <div class="flex mb-3">
              <button class="ml-auto px-4 py-1 rounded-full text-white bg-pink-500 font-medium hover:bg-pink-700 transition-all shadow" onclick="openHealthModal()">
                <i class="fa fa-plus mr-2"></i> Add Health Entry
              </button>
            </div>
            <div class="relative overflow-x-auto no-scrollbar shadow rounded-xl">
              <table class="min-w-full text-sm text-left table-auto">
                <thead>
                  <tr class="bg-gradient-to-r from-pink-100 via-pink-50 to-pink-200">
                    <th class="py-2 px-3 font-bold">Date</th>
                    <th class="py-2 px-3 font-bold">Animal</th>
                    <th class="py-2 px-3 font-bold">Type</th>
                    <th class="py-2 px-3 font-bold">Details</th>
                    <th class="py-2 px-3 font-bold">Status</th>
                    <th class="py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody id="healthTableBody" class="bg-white">
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- FEEDING COSTS PAGE -->
        <section id="feeding" class="tab-content fade-in w-full relative">
          <button id="feedingMenuBtn" class="dashboard-fixed-btn md:hidden" style="top:23px; left:19px; z-index:45;"><i class="fa fa-bars"></i></button>
          <div class="section-title flex items-center text-green-700 mt-3 px-3"><i class="fa fa-bone mr-3"></i> Feeding Costs</div>
          <div class="glass glass-card p-3 md:p-6 mx-3">
            <div class="flex mb-3">
              <button class="ml-auto px-4 py-1 rounded-full text-white bg-green-500 font-medium hover:bg-green-700 transition-all shadow" onclick="openFeedModal()">
                <i class="fa fa-plus mr-2"></i> Log Feeding
              </button>
            </div>
            <div class="relative overflow-x-auto no-scrollbar shadow rounded-xl">
              <table class="min-w-full text-sm text-left table-auto">
                <thead>
                  <tr class="bg-gradient-to-r from-green-100 via-green-50 to-green-200">
                    <th class="py-2 px-3 font-bold">Date</th>
                    <th class="py-2 px-3 font-bold">Feed Type</th>
                    <th class="py-2 px-3 font-bold">Animal(s)</th>
                    <th class="py-2 px-3 font-bold">Quantity</th>
                    <th class="py-2 px-3 font-bold">Cost</th>
                    <th class="py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody id="feedingTableBody" class="bg-white">
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- REPORTS PAGE -->
        <section id="report" class="tab-content fade-in w-full relative">
          <button id="reportMenuBtn" class="dashboard-fixed-btn md:hidden" style="top:23px; left:19px; z-index:45;"><i class="fa fa-bars"></i></button>
          <div class="section-title flex items-center text-purple-700 mt-3 px-3 mb-3"><i class="fa fa-chart-pie mr-3"></i> Reports & Distribution</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mx-3">
            <div class="glass glass-card p-7">
              <div class="font-bold mb-3 text-blue-800 flex items-center gap-2"><i class="fa fa-chart-pie"></i> Animal Distribution</div>
              <canvas id="distributionChart2" style="max-width:320px;max-height:320px;" aria-label="Animal Distribution Pie"></canvas>
            </div>
            <div class="glass glass-card p-7">
              <div class="font-bold mb-3 text-yellow-700 flex items-center gap-2"><i class="fa fa-receipt"></i> Month Report</div>
              <div id="monthlySummary2" class="mb-5"></div>
              <div class="flex gap-7 items-center mt-3">
                <div class="flex flex-col items-center">
                  <div class="rounded-full bg-green-100 w-12 h-12 flex items-center justify-center text-green-500 text-xl">
                    <i class="fa fa-seedling"></i>
                  </div>
                  <span class="text-xs font-bold mt-1">Feeds</span>
                  <span id="summaryFeeds2" class="font-mono text-base"></span>
                </div>
                <div class="flex flex-col items-center">
                  <div class="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center text-blue-500 text-xl">
                    <i class="fa fa-stethoscope"></i>
                  </div>
                  <span class="text-xs font-bold mt-1">Health</span>
                  <span id="summaryHealth2" class="font-mono text-base"></span>
                </div>
                <div class="flex flex-col items-center">
                  <div class="rounded-full bg-yellow-100 w-12 h-12 flex items-center justify-center text-yellow-400 text-xl">
                    <i class="fa fa-rupee-sign"></i>
                  </div>
                  <span class="text-xs font-bold mt-1">Cost</span>
                  <span id="summaryCost2" class="font-mono text-base"></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- PROFILE SETTINGS PAGE -->
        <section id="settings" class="tab-content fade-in w-full relative">
          <button id="settingsMenuBtn" class="dashboard-fixed-btn md:hidden" style="top:23px; left:19px; z-index:45;"><i class="fa fa-bars"></i></button>
          <div class="section-title flex gap-2 items-center text-blue-800 mt-3 px-3 mb-2">
            <i class="fa fa-gear"></i> Profile & Settings
          </div>
          <div class="glass glass-card max-w-2xl p-7 mx-3">
            <form id="profileForm" class="space-y-5">
              <div class="flex flex-col gap-4 mb-4">
                <div class="flex gap-7 items-center">
                  <img id="profileImage" src="<?php echo htmlspecialchars($profile_image); ?>" alt="Profile" class="profile-img border border-blue-100" onerror="this.src='../assets/images/wh.jpg'"/>
                  <div class="flex flex-col gap-2">
                    <label for="profilePictureInput" class="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-all">
                      <i class="fa fa-camera mr-2"></i> Choose Profile Picture
                    </label>
                    <input type="file" id="profilePictureInput" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" class="hidden" onchange="handleProfilePictureSelect(event)">
                    <p class="text-xs text-gray-500">Only image files allowed (JPG, PNG, GIF, WEBP - Max 5MB)</p>
                    <div class="flex gap-2 items-center">
                      <input type="text" id="profileImageUrl" class="border px-2 py-1 rounded text-sm" placeholder="Or enter image URL" value="">
                      <button type="button" class="px-3 py-1 text-xs bg-blue-100 rounded hover:bg-blue-200 font-bold" onclick="updateProfilePic()">Update URL</button>
                    </div>
                  </div>
                </div>
                <div id="uploadProgress" class="hidden">
                  <div class="bg-blue-100 rounded-full h-2">
                    <div id="uploadProgressBar" class="bg-blue-600 h-2 rounded-full transition-all" style="width: 0%"></div>
                  </div>
                  <p id="uploadStatus" class="text-xs text-blue-600 mt-1">Uploading...</p>
                </div>
              </div>
              <div class="grid gap-4 md:grid-cols-2">
                <div>
                  <label class="font-medium text-blue-800">Full Name</label>
                  <input type="text" id="profileName" class="border px-2 py-1 rounded w-full mt-1" value="" placeholder="Enter your full name">
                </div>
                <div>
                  <label class="font-medium text-blue-800">Role/Designation</label>
                  <input type="text" id="profileRole" class="border px-2 py-1 rounded w-full mt-1" value="" placeholder="Enter your role">
                </div>
                <div>
                  <label class="font-medium text-blue-800">Email <span class="text-red-500">*</span></label>
                  <input type="email" id="profileEmail" class="border px-2 py-1 rounded w-full mt-1" value="" placeholder="Enter your email" required>
                </div>
                <div>
                  <label class="font-medium text-blue-800">Phone</label>
                  <input type="tel" id="profilePhone" class="border px-2 py-1 rounded w-full mt-1" value="" placeholder="Enter your phone number">
                </div>
              </div>
              <div class="flex items-center gap-4 mt-6">
                <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded transition-all">Save Changes</button>
                <span id="settingsStatus" class="text-green-600 text-sm"></span>
              </div>
            </form>
          </div>
        </section>



      </div>
    </div>
  </main>



  <!-- Footer CONTACT SECTION -->
  <footer class="footer-basic text-blue-900 mt-6 py-8 px-3 flex flex-col items-center relative">
    <div class="max-w-5xl w-full mx-auto grid md:grid-cols-3 gap-10 text-center">
      <!-- Contact -->
      <div>
        <div class="font-bold text-lg mb-2 flex items-center justify-center gap-2 text-blue-700">
          <i class="fa fa-envelope text-blue-400"></i> Contact Us
        </div>
        <div class="mb-1">
          <a href="mailto:info@apnalivestock.com" class="contact-link hover:underline">info@apnalivestock.com</a>
        </div>
        <div>
          <span class="font-mono text-blue-400">+91-6299211631</span>
        </div>
      </div>
      <!-- Office Address -->
      <div>
        <div class="font-bold text-lg mb-2 flex items-center justify-center gap-2 text-blue-700">
          <i class="fa fa-map-marker-alt text-purple-400"></i> Office Address
        </div>
        <div>Apna Livestock, 9th Floor,<br>BH6 LPU,<br>Punjab, phagwara ,India</div>
      </div>
      <!-- Social -->
      <div>
        <div class="font-bold text-lg mb-2 flex items-center justify-center gap-2 text-blue-700">
          <i class="fa fa-comments text-green-400"></i> Social & Support
        </div>
        <div class="flex justify-center gap-4 text-blue-600 text-xl mt-2">
          <a href="https://facebook.com/apnalivestock" target="_blank" aria-label="Facebook"><i class="fab fa-facebook-square"></i></a>
          <a href="https://instagram.com/apnalivestock" target="_blank" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
          <a href="https://twitter.com/apnalivestock" target="_blank" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
          <a href="https://wa.me/919876543210" target="_blank" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
        </div>
      </div>
    </div>
    <div class="mt-7 text-xs text-blue-400 text-center select-none">
      Powered by Apna Livestock Management &copy; 2025
    </div>
    
    <!-- Feedback Button (Fixed on right side) -->
    <button id="feedbackBtn" onclick="openFeedbackModal()" class="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all" title="Give Feedback">
      <i class="fa fa-comment-dots text-xl"></i>
    </button>
</footer>






  <!-- MODALS (hidden by default) -->
  <div id="modalBackdrop" class="hidden fixed inset-0 bg-blue-200 bg-opacity-60 z-50"></div>
  <!-- ANIMAL MODAL -->
  <div id="animalModal" class="fixed-modal-centered glass glass-card shadow-2xl p-7 hidden">
    <div class="text-xl font-bold mb-3" id="animalModalTitle"></div>
    <form id="animalForm" autocomplete="off" class="space-y-3">
      <input type="hidden" id="animalIndex">
      <div>
        <label class="block mb-1 font-medium">Type</label>
        <select class="border rounded w-full py-2" id="animalType" required>
          <option>Cow</option>
          <option>Sheep</option>
          <option>Goat</option>
          <option>Pig</option>
          <option>Chicken</option>
          <option>Other</option>
        </select>
      </div>
      <div>
        <label class="block mb-1 font-medium">Breed</label>
        <input type="text" class="border rounded w-full py-2" id="animalBreed" required>
      </div>
      <div>
        <label class="block mb-1 font-medium">Age</label>
        <input type="number" class="border rounded w-full py-2" id="animalAge" min="0" step="1" required>
      </div>
      <div>
        <label class="block mb-1 font-medium">Status</label>
        <select class="border rounded w-full py-2" id="animalStatus" required>
          <option>Healthy</option>
          <option>Needs Check</option>
          <option>Under Treatment</option>
        </select>
      </div>
      <div>
        <label class="block mb-1 font-medium">Photo (link or filename)</label>
        <input type="text" class="border rounded w-full py-2" id="animalImage" placeholder="../assets/images/wh.jpg or https://...">
      </div>
      <div class="flex items-center justify-end gap-2 pt-2">
        <button type="button" class="px-4 py-1 rounded border font-medium" onclick="closeAnimalModal()">Cancel</button>
        <button type="submit" class="px-5 py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all">Save</button>
      </div>
    </form>
  </div>
  <!-- HEALTH MODAL -->
  <div id="healthModal" class="fixed-modal-centered glass glass-card shadow-2xl p-7 hidden">
    <div class="text-xl font-bold mb-3" id="healthModalTitle"></div>
    <form id="healthForm" autocomplete="off" class="space-y-3">
      <input type="hidden" id="healthIndex">
      <div>
        <label class="block mb-1 font-medium">Date</label>
        <input type="date" class="border rounded w-full py-2" id="healthDate" required>
      </div>
      <div>
        <label class="block mb-1 font-medium">Animal</label>
        <select class="border rounded w-full py-2" id="healthAnimal" required></select>
      </div>
      <div>
        <label class="block mb-1 font-medium">Type</label>
        <select class="border rounded w-full py-2" id="healthType" required>
          <option>Vaccination</option>
          <option>Checkup</option>
          <option>Treatment</option>
          <option>Routine</option>
          <option>Other</option>
        </select>
      </div>
      <div>
        <label class="block mb-1 font-medium">Details</label>
        <input type="text" class="border rounded w-full py-2" id="healthDetails" required>
      </div>
      <div>
        <label class="block mb-1 font-medium">Status</label>
        <select class="border rounded w-full py-2" id="healthStatus" required>
          <option>Completed</option>
          <option>Scheduled</option>
          <option>Alert</option>
        </select>
      </div>
      <div class="flex items-center justify-end gap-2 pt-2">
        <button type="button" class="px-4 py-1 rounded border font-medium" onclick="closeHealthModal()">Cancel</button>
        <button type="submit" class="px-5 py-2 rounded bg-pink-600 text-white font-bold hover:bg-pink-700 transition-all">Save</button>
      </div>
    </form>
  </div>
  <!-- FEEDING MODAL -->
  <div id="feedModal" class="fixed-modal-centered glass glass-card shadow-2xl p-7 hidden">
    <div class="text-xl font-bold mb-3" id="feedModalTitle"></div>
    <form id="feedForm" autocomplete="off" class="space-y-3">
      <input type="hidden" id="feedIndex">
      <div>
        <label class="block mb-1 font-medium">Date</label>
        <input type="date" class="border rounded w-full py-2" id="feedDate" required>
      </div>
      <div>
        <label class="block mb-1 font-medium">Feed Type</label>
        <input type="text" class="border rounded w-full py-2" id="feedType" required>
      </div>
      <div>
        <label class="block mb-1 font-medium">Animals (comma separated)</label>
        <input type="text" class="border rounded w-full py-2" id="feedAnimals" placeholder="Cow #1, Sheep #2" required>
      </div>
      <div>
        <label class="block mb-1 font-medium">Quantity (kg)</label>
        <input type="number" class="border rounded w-full py-2" id="feedQty" min="0" step="0.1" required>
      </div>
      <div>
        <label class="block mb-1 font-medium">Cost (₹)</label>
        <input type="number" class="border rounded w-full py-2" id="feedCost" min="0" step="1" required>
      </div>
      <div class="flex items-center justify-end gap-2 pt-2">
        <button type="button" class="px-4 py-1 rounded border font-medium" onclick="closeFeedModal()">Cancel</button>
        <button type="submit" class="px-5 py-2 rounded bg-green-600 text-white font-bold hover:bg-green-700 transition-all">Save</button>
      </div>
    </form>
  </div>





<!-- FEEDBACK MODAL -->
<div id="feedbackModal" class="fixed-modal-centered glass glass-card shadow-2xl p-7 hidden z-50">
  <div class="flex justify-between items-center mb-5">
    <div class="text-xl font-bold text-blue-700 flex items-center gap-2">
      <i class="fa fa-comment-dots"></i> Share Your Feedback
    </div>
    <button onclick="closeFeedbackModal()" class="text-blue-400 hover:text-blue-600" aria-label="Close">
      <i class="fa fa-times text-lg"></i>
    </button>
  </div>
  
  <form id="feedbackForm" autocomplete="off" class="space-y-4">
    <div>
      <label class="block mb-1 font-medium text-blue-800">Feedback Type</label>
      <select class="border border-blue-200 rounded w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-300" id="feedbackType" required>
        <option value="">-- Select Type --</option>
        <option value="suggestion">Suggestion</option>
        <option value="bug">Bug Report</option>
        <option value="feature">Feature Request</option>
        <option value="compliment">Compliment</option>
        <option value="other">Other</option>
      </select>
    </div>
    
    <div>
      <label class="block mb-1 font-medium text-blue-800">Your Experience</label>
      <div class="flex gap-3 text-2xl text-blue-200 mb-1">
        <i class="far fa-star cursor-pointer rating-star" data-rating="1"></i>
        <i class="far fa-star cursor-pointer rating-star" data-rating="2"></i>
        <i class="far fa-star cursor-pointer rating-star" data-rating="3"></i>
        <i class="far fa-star cursor-pointer rating-star" data-rating="4"></i>
        <i class="far fa-star cursor-pointer rating-star" data-rating="5"></i>
      </div>
      <div class="text-xs text-blue-500 italic mb-2" id="ratingText">Select rating</div>
      <input type="hidden" id="feedbackRating" value="0">
    </div>
    
    <div>
      <label class="block mb-1 font-medium text-blue-800">Your Comments</label>
      <textarea class="border border-blue-200 rounded w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-300" id="feedbackComments" rows="4" required placeholder="Please share your thoughts, suggestions or report issues..."></textarea>
    </div>
    
    <div>
      <label class="block mb-1 font-medium text-blue-800">Email (optional)</label>
      <input type="email" class="border border-blue-200 rounded w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-300" id="feedbackEmail" placeholder="Your email for follow-up (optional)">
    </div>
    
    <div class="flex items-center justify-end gap-3 pt-3">
      <button type="button" class="px-4 py-2 rounded-md border border-blue-300 font-medium hover:bg-blue-50 transition-all" onclick="closeFeedbackModal()">Cancel</button>
      <button type="submit" class="px-5 py-2 rounded-md bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all">
        <i class="fa fa-paper-plane mr-1"></i> Submit Feedback
      </button>
    </div>
  </form>
  
  <!-- Success message (hidden by default) -->
  <div id="feedbackSuccess" class="hidden text-center py-8">
    <div class="text-5xl text-green-500 mb-4">
      <i class="fa fa-check-circle"></i>
    </div>
    <div class="text-xl font-bold text-blue-700 mb-2">Thank You!</div>
    <div class="text-blue-600 mb-6">Your feedback has been submitted successfully.</div>
    <button onclick="closeFeedbackModal()" class="px-5 py-2 rounded-md bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all">
      Close
    </button>
  </div>
</div>

</div>
<div id="feedbackBackdrop" class="fixed inset-0 bg-blue-900 bg-opacity-40 z-40 hidden"></div>

</div>

  <script src="../assets/js/script.js"></script>
</body>
</html>

