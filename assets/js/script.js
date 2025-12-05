let userAnimals = [];
let userHealthRecords = [];
let userFeedingData = [];
let userProfile = {};
let dashboardStats = {};
let recentActivities = [];

// ===== FEEDBACK MODAL FUNCTIONS =====
function openFeedbackModal() {
    document.getElementById('feedbackModal').classList.remove('hidden');
    document.getElementById('feedbackBackdrop').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Reset form
    document.getElementById('feedbackForm').classList.remove('hidden');
    document.getElementById('feedbackSuccess').classList.add('hidden');
    document.getElementById('feedbackForm').reset();
    document.getElementById('feedbackRating').value = "0";
    document.getElementById('ratingText').innerText = "Select rating";
    
    // Reset stars
    document.querySelectorAll('.rating-star').forEach(star => {
        star.classList.remove('fas', 'text-yellow-400');
        star.classList.add('far', 'text-gray-300');
    });
}

function closeFeedbackModal() {
    document.getElementById('feedbackModal').classList.add('hidden');
    document.getElementById('feedbackBackdrop').classList.add('hidden');
    document.body.style.overflow = '';
}

// ===== API FUNCTIONS =====

// Load user profile and initialize dashboard
async function loadUserProfile() {
    try {
        const response = await fetch('../api/profile.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const profile = await response.json();
        
        if (profile && !profile.error) {
            userProfile = profile;
            updateWelcomeMessage();
            updateProfileDisplay();
        } else {
            console.error('Error loading profile:', profile.error);
            showNotification('Error loading profile: ' + (profile.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Network error loading profile:', error);
        showNotification('Network error loading profile. Please check your connection.', 'error');
    }
}

// Load animals from database
async function loadAnimals() {
    try {
        const response = await fetch('../api/animals.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result && !result.error) {
            userAnimals = Array.isArray(result) ? result : [];
            renderAnimalTable();
            renderDistributionChart();
            renderHealthAnimalSelect();
        } else {
            console.error('Error loading animals:', result.error);
            showNotification('Error loading animals: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Network error loading animals:', error);
        showNotification('Network error loading animals. Please check your connection.', 'error');
    }
}

// Load health records
async function loadHealthRecords() {
    try {
        const response = await fetch('../api/health.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result && !result.error) {
            userHealthRecords = Array.isArray(result) ? result : [];
            renderHealthTable();

            // ✅ Add this line:
            updateDashboardStats();
        } else {
            console.error('Error loading health records:', result.error);
            showNotification('Error loading health records: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Network error loading health records:', error);
        showNotification('Network error loading health records. Please check your connection.', 'error');
    }
}

// Load feeding data
async function loadFeedingData() {
    try {
        const response = await fetch('../api/feeding.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result && !result.error) {
            userFeedingData = Array.isArray(result) ? result : [];
            renderFeedingTable();
        } else {
            console.error('Error loading feeding data:', result.error);
            showNotification('Error loading feeding data: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Network error loading feeding data:', error);
        showNotification('Network error loading feeding data. Please check your connection.', 'error');
    }
}

// Load dashboard statistics from server
async function loadDashboardStats() {
    try {
        const response = await fetch('../api/dashboard.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result && !result.error) {
            dashboardStats = result;
            updateDashboardDisplay();
            renderMonthlySummary();
        } else {
            console.error('Error loading dashboard stats:', result.error);
            showNotification('Error loading dashboard: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Network error loading dashboard stats:', error);
        showNotification('Network error loading dashboard. Please check your connection.', 'error');
    }
}

// Load recent activities
async function loadRecentActivities() {
    try {
        const response = await fetch('../api/activities.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result && !result.error) {
            recentActivities = Array.isArray(result) ? result : [];
            renderActivityTimeline();
        } else {
            console.error('Error loading activities:', result.error);
            // Don't show error notification for activities as it's not critical
        }
    } catch (error) {
        console.error('Network error loading activities:', error);
        // Don't show error notification for activities as it's not critical
    }
}

// Add activity log entry
async function addActivityLog(action, details) {
    try {
        const response = await fetch('../api/activities.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: action,
                details: details,
                timestamp: new Date().toISOString()
            })
        });

        if (response.ok) {
            // Wait for the backend to save the activity before reloading
            await response.json();
            await loadRecentActivities();
        }
    } catch (error) {
        console.error('Error adding activity log:', error);
    }
}

// Update dashboard widgets
function updateDashboardDisplay() {
    const animalsEl = document.getElementById('dashboardAnimals');
    const healthEl = document.getElementById('dashboardHealthRecords');
    const feedingsEl = document.getElementById('dashboardFeedings');
    const costEl = document.getElementById('dashboardCost');
    
    if (animalsEl) animalsEl.innerText = dashboardStats.total_animals || 0;
    if (healthEl) healthEl.innerText = dashboardStats.total_health_records || 0;
    if (feedingsEl) feedingsEl.innerText = dashboardStats.total_feedings || 0;
    if (costEl) costEl.innerText = dashboardStats.total_cost ? `₱${dashboardStats.total_cost}` : '₱0';
}

// ===== ANIMAL MANAGEMENT =====

// Add new animal
async function addAnimal(animalData) {
    try {
        const response = await fetch('../api/animals.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(animalData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result && result.success) {
            // Add activity log and wait for it to complete before reloading activities
            await addActivityLog('Added Animal', `Added ${animalData.type} - ${animalData.breed}`);
            
            // Reload data (no need to reload activities here, already done in addActivityLog)
            await Promise.all([
                loadAnimals(),
                loadDashboardStats()
            ]);
            
            closeAnimalModal();
            showNotification('Animal added successfully!', 'success');
        } else {
            showNotification('Error adding animal: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Network error adding animal:', error);
        showNotification('Network error adding animal. Please check your connection.', 'error');
    }
}

// Update animal
async function updateAnimal(animalId, animalData) {
    try {
        const response = await fetch('../api/animals.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: animalId,
                ...animalData
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result && result.success) {
            // Add activity log and wait for it to complete before reloading activities
            await addActivityLog('Updated Animal', `Updated ${animalData.type} - ${animalData.breed}`);
            
            // Reload data (no need to reload activities here, already done in addActivityLog)
            await Promise.all([
                loadAnimals(),
                loadDashboardStats()
            ]);
            
            closeAnimalModal();
            showNotification('Animal updated successfully!', 'success');
        } else {
            showNotification('Error updating animal: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Network error updating animal:', error);
        showNotification('Network error updating animal. Please check your connection.', 'error');
    }
}

// Delete animal
async function deleteAnimal(animalId) {
    if (!confirm('Are you sure you want to delete this animal? This action cannot be undone.')) {
        return;
    }

    try {
        const animal = userAnimals.find(a => a.id == animalId);
        const animalName = animal ? `${animal.type} - ${animal.breed}` : 'Animal';
        
        const response = await fetch(`../api/animals.php?id=${animalId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result && result.success) {
            // Add activity log and wait for it to complete before reloading activities
            await addActivityLog('Deleted Animal', `Deleted ${animalName}`);
            
            // Reload data (no need to reload activities here, already done in addActivityLog)
            await Promise.all([
                loadAnimals(),
                loadDashboardStats()
            ]);
            
            showNotification('Animal deleted successfully!', 'success');
        } else {
            showNotification('Error deleting animal: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Network error deleting animal:', error);
        showNotification('Network error deleting animal. Please check your connection.', 'error');
    }
}

// ===== HEALTH RECORDS MANAGEMENT =====

// Add health record
async function addHealthRecord(healthData) {
    try {
        // Ensure animal_id is a number if possible
        if (healthData.animal_id) {
            healthData.animal_id = parseInt(healthData.animal_id);
        }
        const response = await fetch('../api/health.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(healthData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }

        const result = await response.json();

        if (result && result.success) {
            // Add activity log and wait for it to complete before reloading activities
            await addActivityLog('Added Health Record', `Added ${healthData.type} record`);

            // Reload data
            await Promise.all([
                loadHealthRecords(),
                loadDashboardStats()
            ]);

            closeHealthModal();
            showNotification('Health record added successfully!', 'success');
        } else {
            showNotification('Error adding health record: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Network error adding health record:', error);
        showNotification('Network error adding health record. Please check your connection. ' + error, 'error');
    }
}
// Update health record
async function updateHealthRecord(recordId, healthData) {
    try {
        const response = await fetch('../api/health.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: recordId,
                ...healthData
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result && result.success) {
            // Add activity log and wait for it to complete before reloading activities
            await addActivityLog('Updated Health Record', `Updated ${healthData.type} record`);
            
            // Reload data
            await Promise.all([
                loadHealthRecords(),
                loadDashboardStats()
            ]);
            
            closeHealthModal();
            showNotification('Health record updated successfully!', 'success');
        } else {
            showNotification('Error updating health record: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Network error updating health record:', error);
        showNotification('Network error updating health record. Please check your connection.', 'error');
    }
}
// Delete health record
async function deleteHealthRecord(recordId) {
    if (!confirm('Are you sure you want to delete this health record?')) {
        return;
    }
    
    try {
        const record = userHealthRecords.find(r => r.id == recordId);
        const recordName = record ? record.type : 'Health Record';
        
        const response = await fetch('../api/health.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: recordId })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result && result.success) {
            // Add activity log and wait for it to complete before reloading activities
            await addActivityLog('Deleted Health Record', `Deleted ${recordName}`);
            
            // Reload data
            await Promise.all([
                loadHealthRecords(),
                loadDashboardStats()
            ]);
            
            showNotification('Health record deleted successfully!', 'success');
        } else {
            showNotification('Error deleting health record: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Network error deleting health record:', error);
        showNotification('Network error deleting health record. Please check your connection.', 'error');
    }
}

// Add feeding record
async function addFeedingRecord(feedingData) {
    try {
        // Ensure quantity and cost are numbers
        if (feedingData.quantity) feedingData.quantity = parseFloat(feedingData.quantity);
        if (feedingData.cost) feedingData.cost = parseFloat(feedingData.cost);

        const response = await fetch('../api/feeding.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(feedingData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }

        const result = await response.json();

        if (result && result.success) {
            // Add activity log and wait for it to complete before reloading activities
            await addActivityLog('Added Feeding Record', `Added ${feedingData.feed_type} feeding`);

            // Reload data
            await Promise.all([
                loadFeedingData(),
                loadDashboardStats()
            ]);

            closeFeedModal();
            showNotification('Feeding record added successfully!', 'success');
        } else {
            showNotification('Error adding feeding record: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Network error adding feeding record:', error);
        showNotification('Network error adding feeding record. Please check your connection. ' + error, 'error');
    }
}
// Update feeding record
async function updateFeedingRecord(recordId, feedingData) {
    try {
        const response = await fetch('../api/feeding.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: recordId,
                ...feedingData
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result && result.success) {
            // Add activity log and wait for it to complete before reloading activities
            await addActivityLog('Updated Feeding Record', `Updated ${feedingData.feed_type} feeding`);
            
            // Reload data
            await Promise.all([
                loadFeedingData(),
                loadDashboardStats()
            ]);
            
            closeFeedModal();
            showNotification('Feeding record updated successfully!', 'success');
        } else {
            showNotification('Error updating feeding record: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Network error updating feeding record:', error);
        showNotification('Network error updating feeding record. Please check your connection.', 'error');
    }
}
// Delete feeding record
async function deleteFeedingRecord(recordId) {
    if (!confirm('Are you sure you want to delete this feeding record?')) {
        return;
    }
    
    try {
        const record = userFeedingData.find(r => r.id == recordId);
        const recordName = record ? record.feed_type : 'Feeding Record';
        
        const response = await fetch('../api/feeding.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: recordId })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result && result.success) {
            // Add activity log and wait for it to complete before reloading activities
            await addActivityLog('Deleted Feeding Record', `Deleted ${recordName}`);
            
            // Reload data
            await Promise.all([
                loadFeedingData(),
                loadDashboardStats()
            ]);
            
            showNotification('Feeding record deleted successfully!', 'success');
        } else {
            showNotification('Error deleting feeding record: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Network error deleting feeding record:', error);
        showNotification('Network error deleting feeding record. Please check your connection.', 'error');
    }
}
    const welcomeElement = document.getElementById('welcomeMsg');
    if (welcomeElement && userProfile) {
        // Use full_name if available, otherwise username
        // Only update if we have a valid name (don't overwrite with empty/null)
        const displayName = userProfile.full_name || userProfile.username;
        if (displayName && displayName.trim() !== '') {
            welcomeElement.innerHTML = `Welcome back, ${displayName.trim()}! Let's manage your livestock today.`;
        }
        // If no name available, keep the existing PHP-generated message (which already has proper fallback)
    }

// Update profile display
function updateProfileDisplay() {
    // Update profile form input fields with user data (or empty if no data)
    const profileNameInput = document.getElementById('profileName');
    const profileEmailInput = document.getElementById('profileEmail');
    const profileRoleInput = document.getElementById('profileRole');
    const profilePhoneInput = document.getElementById('profilePhone');
    const profileImageInput = document.getElementById('profileImageUrl');
    const profileImage = document.getElementById('profileImage');
    
    if (profileNameInput) {
        profileNameInput.value = userProfile.full_name || '';
    }
    if (profileEmailInput) {
        profileEmailInput.value = userProfile.email || '';
    }
    if (profileRoleInput) {
        profileRoleInput.value = userProfile.role || '';
    }
    if (profilePhoneInput) {
        profilePhoneInput.value = userProfile.phone || '';
    }
    if (profileImageInput) {
        // Display path with ../ prefix if it doesn't have it (for display in input field)
        let imageUrl = userProfile.profile_image || '';
        if (imageUrl && !imageUrl.startsWith('../') && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
            imageUrl = '../' + imageUrl;
        }
        profileImageInput.value = imageUrl;
    }
    if (profileImage) {
        // Handle both relative paths (../assets/...) and absolute paths (assets/...)
        let imageSrc = userProfile.profile_image || '../assets/images/wh.jpg';
        if (imageSrc && !imageSrc.startsWith('../') && !imageSrc.startsWith('http') && !imageSrc.startsWith('data:')) {
            imageSrc = '../' + imageSrc;
        }
        profileImage.src = imageSrc;
        // Add error handler to fallback to default image
        profileImage.onerror = function() {
            this.src = '../assets/images/wh.jpg';
        };
    }
    
    // Also update dashboard profile image
    const profileImageDash = document.getElementById('profileImageDash');
    if (profileImageDash) {
        let imageSrc = userProfile.profile_image || '../assets/images/wh.jpg';
        if (imageSrc && !imageSrc.startsWith('../') && !imageSrc.startsWith('http') && !imageSrc.startsWith('data:')) {
            imageSrc = '../' + imageSrc;
        }
        profileImageDash.src = imageSrc;
        // Add error handler to fallback to default image
        profileImageDash.onerror = function() {
            this.src = '../assets/images/wh.jpg';
        };
    }
}

// Update profile picture preview from URL
function updateProfilePic() {
    const imageUrl = document.getElementById('profileImageUrl').value.trim();
    const profileImage = document.getElementById('profileImage');
    const profileImageDash = document.getElementById('profileImageDash');
    
    if (imageUrl) {
        if (profileImage) {
            profileImage.src = imageUrl;
        }
        if (profileImageDash) {
            profileImageDash.src = imageUrl;
        }
        showNotification('Profile image preview updated. Click "Save Changes" to save.', 'info');
    } else {
        showNotification('Please enter an image URL or filename', 'error');
    }
}

// Handle profile picture file selection
function handleProfilePictureSelect(event) {
    const file = event.target.files[0];
    
    if (!file) {
        return;
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        showNotification('Only image files are allowed (JPG, JPEG, PNG, GIF, WEBP)', 'error');
        event.target.value = ''; // Clear the input
        return;
    }
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        showNotification('File size exceeds maximum allowed size of 5MB', 'error');
        event.target.value = ''; // Clear the input
        return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const profileImage = document.getElementById('profileImage');
        const profileImageDash = document.getElementById('profileImageDash');
        
        if (profileImage) {
            profileImage.src = e.target.result;
        }
        if (profileImageDash) {
            profileImageDash.src = e.target.result;
        }
    };
    reader.readAsDataURL(file);
    
    // Upload the file
    uploadProfilePicture(file);
}

// Upload profile picture to server
async function uploadProfilePicture(file) {
    const formData = new FormData();
    formData.append('profile_picture', file);
    
    // Show upload progress
    const uploadProgress = document.getElementById('uploadProgress');
    const uploadProgressBar = document.getElementById('uploadProgressBar');
    const uploadStatus = document.getElementById('uploadStatus');
    
    if (uploadProgress) {
        uploadProgress.classList.remove('hidden');
        uploadProgressBar.style.width = '0%';
        uploadStatus.textContent = 'Uploading...';
    }
    
    try {
        const xhr = new XMLHttpRequest();
        
        // Track upload progress
        xhr.upload.addEventListener('progress', function(e) {
            if (e.lengthComputable && uploadProgressBar) {
                const percentComplete = (e.loaded / e.total) * 100;
                uploadProgressBar.style.width = percentComplete + '%';
            }
        });
        
        // Handle response
        xhr.addEventListener('load', function() {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                
                if (response.success) {
                    // Update profile image paths
                    const profileImage = document.getElementById('profileImage');
                    const profileImageDash = document.getElementById('profileImageDash');
                    const profileImageUrl = document.getElementById('profileImageUrl');
                    
                    if (profileImage) {
                        profileImage.src = response.image_path;
                    }
                    if (profileImageDash) {
                        profileImageDash.src = response.image_path;
                    }
                    if (profileImageUrl) {
                        // Store path with ../ prefix for display in input field
                        profileImageUrl.value = response.image_path;
                    }
                    
                    // Update userProfile object (preserve other fields)
                    // Store path without ../ prefix (as it's stored in database)
                    let dbPath = response.image_path;
                    if (dbPath.startsWith('../')) {
                        dbPath = dbPath.substring(3); // Remove '../' prefix
                    }
                    if (userProfile) {
                        userProfile.profile_image = dbPath;
                    } else {
                        // If userProfile doesn't exist, create it with current session data
                        userProfile = {
                            profile_image: dbPath
                        };
                    }
                    
                    if (uploadStatus) {
                        uploadStatus.textContent = 'Upload successful!';
                        uploadStatus.className = 'text-xs text-green-600 mt-1';
                    }
                    
                    showNotification('Profile picture uploaded successfully!', 'success');
                    
                    // Hide progress bar after 2 seconds
                    setTimeout(() => {
                        if (uploadProgress) {
                            uploadProgress.classList.add('hidden');
                        }
                    }, 2000);
                } else {
                    throw new Error(response.error || 'Upload failed');
                }
            } else {
                const response = JSON.parse(xhr.responseText);
                throw new Error(response.error || 'Upload failed');
            }
        });
        
        // Handle errors
        xhr.addEventListener('error', function() {
            if (uploadStatus) {
                uploadStatus.textContent = 'Upload failed. Please try again.';
                uploadStatus.className = 'text-xs text-red-600 mt-1';
            }
            showNotification('Failed to upload profile picture. Please try again.', 'error');
            
            setTimeout(() => {
                if (uploadProgress) {
                    uploadProgress.classList.add('hidden');
                }
            }, 3000);
        });
        
        // Send request
        xhr.open('POST', '../api/upload_profile_pic.php');
        xhr.send(formData);
        
    } catch (error) {
        console.error('Upload error:', error);
        if (uploadStatus) {
            uploadStatus.textContent = 'Upload failed. Please try again.';
            uploadStatus.className = 'text-xs text-red-600 mt-1';
        }
        showNotification('Failed to upload profile picture: ' + error.message, 'error');
        
        setTimeout(() => {
            if (uploadProgress) {
                uploadProgress.classList.add('hidden');
            }
        }, 3000);
    }
}

// Make functions available globally
window.updateProfilePic = updateProfilePic;
window.handleProfilePictureSelect = handleProfilePictureSelect;


// Render animal table
function renderAnimalTable() {
    const tbody = document.getElementById('inventoryTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (userAnimals.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                    No animals found. Click "Add Animal" to get started.
                </td>
            </tr>
        `;
        return;
    }
    
    userAnimals.forEach((animal) => {
        const statusClass = getStatusClass(animal.status);
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-200 hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#${animal.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${animal.type}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${animal.breed}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${animal.age} yr</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}">
                    ${animal.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${animal.type}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="openAnimalModal('${animal.id}')" class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteAnimal('${animal.id}')" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Render health records table
function renderHealthTable() {
    const tbody = document.getElementById('healthTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (userHealthRecords.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                    No health records found. Click "Add Health Record" to get started.
                </td>
            </tr>
        `;
        return;
    }
    
    userHealthRecords.forEach(record => {
        const statusClass = getStatusClass(record.status);
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-200 hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${record.record_date}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${record.animal_type || 'N/A'} #${record.animal_id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${record.type}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${record.details}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}">
                    ${record.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="openHealthModal('${record.id}')" class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteHealthRecord('${record.id}')" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Render feeding table
function renderFeedingTable() {
    const tbody = document.getElementById('feedingTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (userFeedingData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                    No feeding records found. Click "Add Feeding Record" to get started.
                </td>
            </tr>
        `;
        return;
    }
    
    userFeedingData.forEach(feed => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-200 hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${feed.feed_date}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${feed.feed_type}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${feed.animals}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${feed.quantity} kg</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱${feed.cost}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="openFeedModal('${feed.id}')" class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteFeedingRecord('${feed.id}')" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Render health animal select dropdown
function renderHealthAnimalSelect() {
    const select = document.getElementById('healthAnimal');
    if (!select) return;
    
    select.innerHTML = '<option value="">Select Animal</option>';
    
    userAnimals.forEach(animal => {
        const option = document.createElement('option');
        option.value = animal.id;
        option.textContent = `${animal.type} #${animal.id} - ${animal.breed}`;
        select.appendChild(option);
    });
}

// Render activity timeline
function renderActivityTimeline() {
    const container = document.getElementById('activityTimeline');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (recentActivities.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-4">
                <i class="fas fa-clock text-2xl mb-2"></i>
                <p>No recent activities</p>
            </div>
        `;
        return;
    }
    
    recentActivities.slice(0, 10).forEach(activity => {
        const activityElement = document.createElement('div');
        activityElement.className = 'flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg';
        
        const iconClass = getActivityIcon(activity.action);
        const timeAgo = getTimeAgo(activity.created_at || activity.timestamp);
        
        activityElement.innerHTML = `
            <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <i class="${iconClass} text-blue-600 text-sm"></i>
                </div>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">${activity.action}</p>
                <p class="text-sm text-gray-500">${activity.details}</p>
                <p class="text-xs text-gray-400 mt-1">${timeAgo}</p>
            </div>
        `;
        
        container.appendChild(activityElement);
    });
}

// Get activity icon based on action
function getActivityIcon(action) {
    const iconMap = {
        'Added Animal': 'fas fa-plus',
        'Updated Animal': 'fas fa-edit',
        'Deleted Animal': 'fas fa-trash',
        'Added Health Record': 'fas fa-heartbeat',
        'Updated Health Record': 'fas fa-heartbeat',
        'Deleted Health Record': 'fas fa-heartbeat',
        'Added Feeding Record': 'fas fa-utensils',
        'Updated Feeding Record': 'fas fa-utensils',
        'Deleted Feeding Record': 'fas fa-utensils'
    };
    return iconMap[action] || 'fas fa-info-circle';
}

// Get time ago string

// Get time ago string
function getTimeAgo(timestamp) {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - activityTime) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
}

// Helper function to get status CSS class
function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case 'healthy':
        case 'completed':
            return 'bg-green-100 text-green-800';
        case 'needs check':
        case 'scheduled':
            return 'bg-yellow-100 text-yellow-800';
        case 'under treatment':
        case 'alert':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

// ===== CHART RENDERING =====

// Render animal distribution chart
function renderDistributionChart() {
    const speciesCount = {};
    userAnimals.forEach(animal => {
        speciesCount[animal.type] = (speciesCount[animal.type] || 0) + 1;
    });
    
    const labels = Object.keys(speciesCount);
    const data = labels.map(label => speciesCount[label]);
    const chartColors = ["#36b3ff", "#27e9c6", "#ffd740", "#fb5e74", "#a991e3", "#fed884"];
    
    // Destroy existing chart if it exists
    if (window.distributionChartInstance) {
        window.distributionChartInstance.destroy();
    }
    
    const canvas = document.getElementById('distributionChart');
    if (canvas && labels.length > 0) {
        window.distributionChartInstance = new Chart(canvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: chartColors.slice(0, labels.length)
                }]
            },
            options: {
                plugins: {
                    legend: { 
                        position: 'bottom', 
                        labels: { font: { weight: "bold" } } 
                    }
                },
                cutout: "62%",
                animation: { 
                    animateRotate: true, 
                    animateScale: true 
                }
            }
        });
    }
    
    // Second chart for reports tab
    const canvas2 = document.getElementById('distributionChart2');
    if (canvas2 && labels.length > 0) {
        if (window.distributionChartInstance2) {
            window.distributionChartInstance2.destroy();
        }
        window.distributionChartInstance2 = new Chart(canvas2.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: chartColors.slice(0, labels.length)
                }]
            },
            options: {
                plugins: {
                    legend: { 
                        position: 'bottom', 
                        labels: { font: { weight: "bold" } } 
                    }
                },
                cutout: "62%",
                animation: { 
                    animateRotate: true, 
                    animateScale: true 
                }
            }
        });
    }
}

// Render monthly summary chart
function renderMonthlySummary() {
    const canvas = document.getElementById('monthlySummaryChart');
    if (!canvas) return;
    
    // Destroy existing chart if it exists
    if (window.monthlySummaryChartInstance) {
        window.monthlySummaryChartInstance.destroy();
    }
    
    // Sample data - replace with actual monthly data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const animalData = [10, 15, 12, 18, 20, 25];
    const healthData = [5, 8, 6, 12, 15, 18];
    const feedingData = [30, 45, 35, 50, 60, 70];
    
    window.monthlySummaryChartInstance = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Animals',
                    data: animalData,
                    borderColor: '#36b3ff',
                    backgroundColor: 'rgba(54, 179, 255, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Health Records',
                    data: healthData,
                    borderColor: '#fb5e74',
                    backgroundColor: 'rgba(251, 94, 116, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Feeding Records',
                    data: feedingData,
                    borderColor: '#27e9c6',
                    backgroundColor: 'rgba(39, 233, 198, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// ===== MODAL FUNCTIONS =====

// Animal modal functions
function openAnimalModal(animalId = null) {
    const isEdit = animalId !== null;
    document.getElementById('animalIndex').value = animalId || '';
    document.getElementById('animalModalTitle').innerText = isEdit ? 'Edit Animal' : 'Add Animal';
    
    if (isEdit) {
        const animal = userAnimals.find(a => a.id == animalId);
        if (animal) {
            document.getElementById('animalType').value = animal.type;
            document.getElementById('animalBreed').value = animal.breed;
            document.getElementById('animalAge').value = animal.age;
            document.getElementById('animalStatus').value = animal.status;
            document.getElementById('animalImage').value = animal.image || '';
        }
    } else {
        // Reset form for new animal
        document.getElementById('animalForm').reset();
    }
    
    showModal('animalModal');
}

function closeAnimalModal() {
    hideModal('animalModal');
}

// Health modal functions
function openHealthModal(recordId = null) {
    const isEdit = recordId !== null;
    document.getElementById('healthIndex').value = recordId || '';
    document.getElementById('healthModalTitle').innerText = isEdit ? 'Edit Health Record' : 'Add Health Record';
    
    if (isEdit) {
        const record = userHealthRecords.find(r => r.id == recordId);
        if (record) {
            document.getElementById('healthAnimal').value = record.animal_id;
            document.getElementById('healthDate').value = record.record_date;
            document.getElementById('healthType').value = record.type;
            document.getElementById('healthDetails').value = record.details;
            document.getElementById('healthStatus').value = record.status;
        }
    } else {
        // Reset form for new record
        document.getElementById('healthForm').reset();
    }
    
    showModal('healthModal');
}

function closeHealthModal() {
    hideModal('healthModal');
}

// Feeding modal functions
function openFeedModal(recordId = null) {
    const isEdit = recordId !== null;
    document.getElementById('feedIndex').value = recordId || '';
    document.getElementById('feedModalTitle').innerText = isEdit ? 'Edit Feeding Record' : 'Add Feeding Record';
    
    if (isEdit) {
        const record = userFeedingData.find(r => r.id == recordId);
        if (record) {
            document.getElementById('feedDate').value = record.feed_date;
            document.getElementById('feedType').value = record.feed_type;
            document.getElementById('feedAnimals').value = record.animals;
            document.getElementById('feedQty').value = record.quantity;
            document.getElementById('feedCost').value = record.cost;
        }
    } else {
        // Reset form for new record
        document.getElementById('feedForm').reset();
    }
    
    showModal('feedModal');
}

function closeFeedModal() {
    hideModal('feedModal');
}

// Modal utility functions
function showModal(modalId) {
    document.getElementById('modalBackdrop').classList.remove('hidden');
    document.getElementById(modalId).classList.remove('hidden');
    document.body.classList.add('overflow-y-hidden');
}

function hideModal(modalId) {
    document.getElementById('modalBackdrop').classList.add('hidden');
    document.getElementById(modalId).classList.add('hidden');
    document.body.classList.remove('overflow-y-hidden');
}

// ===== FORM HANDLING =====

// Initialize all event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Animal form submission
    const animalForm = document.getElementById('animalForm');
    if (animalForm) {
        animalForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const animalId = document.getElementById('animalIndex').value;
            const animalData = {
                type: document.getElementById('animalType').value.trim(),
                breed: document.getElementById('animalBreed').value.trim(),
                age: parseInt(document.getElementById('animalAge').value),
                status: document.getElementById('animalStatus').value.trim(),
                image: document.getElementById('animalImage').value.trim()
            };
            
            // Validate form
            const errors = validateAnimalForm(animalData);
            if (errors.length > 0) {
                showNotification('Please fix the following errors: ' + errors.join(', '), 'error');
                return;
            }
            
            if (animalId) {
                await updateAnimal(animalId, animalData);
            } else {
                await addAnimal(animalData);
            }
        });
    }

    // Health form submission
    const healthForm = document.getElementById('healthForm');
    if (healthForm) {
        healthForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const recordId = document.getElementById('healthIndex').value;
            const healthData = {
                animal_id: document.getElementById('healthAnimal').value,
                date: document.getElementById('healthDate').value,
                type: document.getElementById('healthType').value.trim(),
                details: document.getElementById('healthDetails').value.trim(),
                status: document.getElementById('healthStatus').value.trim()
            };
            
            // Validate form
            const errors = validateHealthForm(healthData);
            if (errors.length > 0) {
                showNotification('Please fix the following errors: ' + errors.join(', '), 'error');
                return;
            }
            
            if (recordId) {
                await updateHealthRecord(recordId, healthData);
            } else {
                await addHealthRecord(healthData);
            }
        });
    }

    // Feeding form submission
    const feedForm = document.getElementById('feedForm');
    if (feedForm) {
        feedForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const recordId = document.getElementById('feedIndex').value;
            const feedingData = {
                feed_date: document.getElementById('feedDate').value,
                feed_type: document.getElementById('feedType').value.trim(),
                animals: document.getElementById('feedAnimals').value.trim(),
                quantity: parseFloat(document.getElementById('feedQty').value),
                cost: parseFloat(document.getElementById('feedCost').value)
            };
            
            // Validate form
            const errors = validateFeedingForm(feedingData);
            if (errors.length > 0) {
                showNotification('Please fix the following errors: ' + errors.join(', '), 'error');
                return;
            }
            
            if (recordId) {
                await updateFeedingRecord(recordId, feedingData);
            } else {
                await addFeedingRecord(feedingData);
            }
        });
    }

    // Profile form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form values
            const formEmail = document.getElementById('profileEmail').value.trim();
            const formFullName = document.getElementById('profileName').value.trim();
            const formRole = document.getElementById('profileRole').value.trim();
            const formPhone = document.getElementById('profilePhone').value.trim();
            const formImage = document.getElementById('profileImageUrl').value.trim();
            
            // Ensure email is never empty - use current profile email if form field is empty
            const email = formEmail || (userProfile && userProfile.email ? userProfile.email : '');
            
            // Validate email is not empty
            if (!email) {
                showNotification('Email is required and cannot be empty', 'error');
                return;
            }
            
            // Validate email format
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            const profileData = {
                full_name: formFullName,
                role: formRole,
                email: email, // Always include email
                phone: formPhone,
                profile_image: formImage || (userProfile && userProfile.profile_image ? userProfile.profile_image : '../assets/images/wh.jpg')
            };
            
            try {
                const response = await fetch('../api/profile.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(profileData)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification('Profile updated successfully!', 'success');
                    document.getElementById('settingsStatus').textContent = 'Profile saved!';
                    
                    // Reload profile to update display
                    await loadUserProfile();
                    
                    // Clear status message after 3 seconds
                    setTimeout(() => {
                        document.getElementById('settingsStatus').textContent = '';
                    }, 3000);
                } else {
                    showNotification('Error updating profile: ' + (result.error || 'Unknown error'), 'error');
                }
            } catch (error) {
                console.error('Profile update error:', error);
                showNotification('Failed to update profile. Please try again.', 'error');
            }
        });
    }

    // Setup star rating for feedback
    const ratingTexts = ["Very Poor", "Poor", "Average", "Good", "Excellent"];
    const stars = document.querySelectorAll('.rating-star');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            document.getElementById('feedbackRating').value = rating;
            document.getElementById('ratingText').innerText = ratingTexts[rating - 1];
            
            // Update stars
            stars.forEach(s => {
                const starRating = parseInt(s.getAttribute('data-rating'));
                if (starRating <= rating) {
                    s.classList.remove('far', 'text-gray-300');
                    s.classList.add('fas', 'text-yellow-400');
                } else {
                    s.classList.remove('fas', 'text-yellow-400');
                    s.classList.add('far', 'text-gray-300');
                }
            });
        });
    });
    
    // Handle feedback form submission
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const feedbackType = document.getElementById('feedbackType').value;
            const rating = document.getElementById('feedbackRating').value;
            const comments = document.getElementById('feedbackComments').value.trim();
            const email = document.getElementById('feedbackEmail').value.trim();
            
            // Validate form
            if (!feedbackType || rating === "0" || !comments) {
                showNotification('Please fill in all required fields and provide a rating.', 'error');
                return;
            }
            
            try {
                // Submit feedback
                const response = await fetch('../api/feedback.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        feedback_type: feedbackType,
                        rating: rating,
                        comments: comments,
                        email: email
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.success) {
                    document.getElementById('feedbackForm').classList.add('hidden');
                    document.getElementById('feedbackSuccess').classList.remove('hidden');
                    showNotification('Feedback submitted successfully! Thank you for your input.', 'success');
                    
                    // Auto-close modal after 3 seconds
                    setTimeout(() => {
                        closeFeedbackModal();
                    }, 3000);
                } else {
                    showNotification("Error: " + (data.message || 'Failed to submit feedback'), 'error');
                }
            } catch (error) {
                console.error('Feedback submission error:', error);
                showNotification("Failed to submit feedback. Please try again later.", 'error');
            }
        });
    }
    
    // Close feedback modal on backdrop click
    const feedbackBackdrop = document.getElementById('feedbackBackdrop');
    if (feedbackBackdrop) {
        feedbackBackdrop.addEventListener('click', function(e) {
            if (e.target === feedbackBackdrop) {
                closeFeedbackModal();
            }
        });
    }
    
    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal:not(.hidden)');
            openModals.forEach(modal => {
                if (modal.id === 'feedbackModal') {
                    closeFeedbackModal();
                } else {
                    hideModal(modal.id);
                }
            });
        }
    });
    
    // Initialize the application
    initializeApp();
});

// ===== NOTIFICATION SYSTEM =====

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 transform translate-x-full`;
    
    // Set notification style based on type
    switch (type) {
        case 'success':
            notification.className += ' bg-green-500 text-white';
            break;
        case 'error':
            notification.className += ' bg-red-500 text-white';
            break;
        case 'warning':
            notification.className += ' bg-yellow-500 text-white';
            break;
        default:
            notification.className += ' bg-blue-500 text-white';
    }
    
    notification.innerHTML = `
        <div class="flex items-center">
            <div class="flex-1">
                <p class="text-sm font-medium">${message}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200 focus:outline-none">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Slide in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// ===== INITIALIZATION =====

// Main initialization function
async function initializeApp() {
    try {
        // Show loading indicator
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.classList.remove('hidden');
        }
        
        // Load all data with retry mechanism
        await loadDataWithRetry();
        
        // Initialize date/time updates
        updateDateTime();
        setInterval(updateDateTime, 30000); // Update every 30 seconds
        
        // Hide loading indicator
        if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
        }
        
        showNotification('Dashboard loaded successfully!', 'success');
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showNotification('Failed to load dashboard data. Please refresh the page.', 'error');
        
        // Hide loading indicator
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
        }
    }
}

// Load data with retry mechanism
async function loadDataWithRetry(retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            // Load all data in sequence to avoid overwhelming the server
            await loadUserProfile();
            await loadAnimals();
            await loadHealthRecords();
            await loadFeedingData();
            await loadDashboardStats();
            await loadRecentActivities();
            
            return; // Success, exit retry loop
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error);
            if (i === retries - 1) {
                throw error; // Last attempt failed, throw error
            }
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

// Date/Time update function
function updateDateTime() {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dateStr = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    
    const dateElement = document.getElementById('todayDateDash');
    const timeElement = document.getElementById('nowTimeDash');
    
    if (dateElement) dateElement.innerText = dateStr;
    if (timeElement) timeElement.innerText = timeStr;
}

// Logout function
function logoutRedirect() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear any stored data
        localStorage.clear();
        sessionStorage.clear();
        
        // Redirect to logout page
        window.location.href = 'logout.php';
    }
}

// ===== NAVIGATION AND MOBILE MENU =====

const navPanel = document.getElementById('dashboardMenu');

function toggleMenu() {
    if (navPanel) {
        navPanel.classList.toggle('open');
    }
}

// Show/hide dashboard menu toggle buttons for mobile only
function placeMobileMenuBtns() {
    const allBtns = [
        document.getElementById('openMenuBtn2'),
        document.getElementById('dashboardMenuBtn'),
        document.getElementById('inventoryMenuBtn'),
        document.getElementById('healthMenuBtn'),
        document.getElementById('feedingMenuBtn'),
        document.getElementById('reportMenuBtn'),
        document.getElementById('settingsMenuBtn')
    ];

    if (window.innerWidth < 900) {
        allBtns.forEach(b => { 
            if (b) b.style.display = 'block'; 
        });
    } else {
        allBtns.forEach(b => { 
            if (b) b.style.display = 'none'; 
        });
        if (navPanel) {
            navPanel.classList.remove('open');
        }
    }
}

// Initialize mobile menu and navigation
document.addEventListener('DOMContentLoaded', function() {
    placeMobileMenuBtns();
    window.addEventListener('resize', placeMobileMenuBtns);
    
    // Attach toggler for all menu buttons
    const menuButtonIds = ['openMenuBtn2', 'dashboardMenuBtn', 'inventoryMenuBtn', 'healthMenuBtn', 'feedingMenuBtn', 'reportMenuBtn', 'settingsMenuBtn'];
    
    menuButtonIds.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', toggleMenu);
        }
    });
    
    // Tab switching logic
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = btn.getAttribute('data-tab');
            
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(sec => {
                sec.classList.remove('active');
            });
            
            // Show selected tab
            const targetTab = document.getElementById(tab);
            if (targetTab) {
                targetTab.classList.add('active');
            }
            
            // Update active button
            document.querySelectorAll('.nav-btn').forEach(b => {
                b.classList.remove('active-tab');
            });
            btn.classList.add('active-tab');
            
            // Close mobile menu
            if (window.innerWidth < 900 && navPanel) {
                navPanel.classList.remove('open');
            }
            
            // Scroll to top
            window.scrollTo(0, 0);
            
            // Refresh charts if switching to reports tab
            if (tab === 'reports') {
                setTimeout(() => {
                    renderDistributionChart();
                    renderMonthlySummary();
                }, 100);
            }
        });
    });
});

// ===== VALIDATION FUNCTIONS =====

function validateAnimalForm(data) {
    const errors = [];
    
    if (!data.type || data.type.trim() === '') {
        errors.push('Animal type is required');
    }
    
    if (!data.breed || data.breed.trim() === '') {
        errors.push('Breed is required');
    }
    
    if (!data.age || data.age < 0 || data.age > 50) {
        errors.push('Valid age (0-50 years) is required');
    }
    
    if (!data.status || data.status.trim() === '') {
        errors.push('Status is required');
    }
    
    return errors;
}

function validateHealthForm(data) {
    const errors = [];
    
    if (!data.animal_id || data.animal_id.trim() === '') {
        errors.push('Animal selection is required');
    }
    
    if (!data.date || data.date.trim() === '') {
        errors.push('Record date is required');
    }
    
    if (!data.type || data.type.trim() === '') {
        errors.push('Health record type is required');
    }
    
    if (!data.details || data.details.trim() === '') {
        errors.push('Details are required');
    }
    
    if (!data.status || data.status.trim() === '') {
        errors.push('Status is required');
    }
    
    return errors;
}

function validateFeedingForm(data) {
    const errors = [];
    
    if (!data.feed_date || data.feed_date.trim() === '') {
        errors.push('Feed date is required');
    }
    
    if (!data.feed_type || data.feed_type.trim() === '') {
        errors.push('Feed type is required');
    }
    
    if (!data.animals || data.animals.trim() === '') {
        errors.push('Animals field is required');
    }
    
    if (!data.quantity || data.quantity <= 0 || data.quantity > 1000) {
        errors.push('Valid quantity (1-1000 kg) is required');
    }
    
    if (!data.cost || data.cost <= 0 || data.cost > 100000) {
        errors.push('Valid cost (₱1-₱100,000) is required');
    }
    
    return errors;
}

// ===== UTILITY FUNCTIONS =====

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== ERROR HANDLING =====

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showNotification('An unexpected error occurred. Please refresh the page.', 'error');
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showNotification('An unexpected error occurred. Please try again.', 'error');
});

// ===== CLEANUP =====

// Cleanup function for when page is unloaded
window.addEventListener('beforeunload', function() {
    // Destroy charts to prevent memory leaks
    if (window.distributionChartInstance) {
        window.distributionChartInstance.destroy();
    }
    if (window.distributionChartInstance2) {
        window.distributionChartInstance2.destroy();
    }
    if (window.monthlySummaryChartInstance) {
        window.monthlySummaryChartInstance.destroy();
    }
});

