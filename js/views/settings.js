export class SettingsView {
  constructor(props) {
    this.props = props || {};
  }
  
  render() {
    const { user } = this.props;
    if (!user) {
      return document.createElement('div');
    }
    
    const container = document.createElement('div');
    container.className = 'max-w-3xl mx-auto';
    
    container.innerHTML = `
      <div class="pb-5 border-b border-gray-200">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Settings
        </h2>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">
          Manage your account settings and preferences.
        </p>
      </div>
      
      <div class="mt-8 space-y-8">
        <!-- Profile Section -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Profile Information</h3>
            
            <div id="profile-success" class="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded hidden">
              Profile updated successfully
            </div>
            
            <div id="profile-error" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded hidden"></div>
            
            <form id="profile-form" class="space-y-4">
              <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-3">
                  <label for="name" class="block text-sm font-medium text-gray-700">
                    Full name
                  </label>
                  <div class="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value="${user.name || ''}"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
    
                <div class="sm:col-span-4">
                  <label for="email" class="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div class="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value="${user.email || ''}"
                      disabled
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                    />
                  </div>
                </div>
              </div>
              
              <div class="flex justify-end">
                <button
                  type="submit"
                  class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <!-- Password Section -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Change Password</h3>
            
            <div id="password-success" class="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded hidden">
              Password updated successfully
            </div>
            
            <div id="password-error" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded hidden"></div>
            
            <form id="password-form" class="space-y-4">
              <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-4">
                  <label for="current-password" class="block text-sm font-medium text-gray-700">
                    Current password
                  </label>
                  <div class="mt-1">
                    <input
                      type="password"
                      name="current-password"
                      id="current-password"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
                
                <div class="sm:col-span-4">
                  <label for="new-password" class="block text-sm font-medium text-gray-700">
                    New password
                  </label>
                  <div class="mt-1">
                    <input
                      type="password"
                      name="new-password"
                      id="new-password"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
                
                <div class="sm:col-span-4">
                  <label for="confirm-password" class="block text-sm font-medium text-gray-700">
                    Confirm password
                  </label>
                  <div class="mt-1">
                    <input
                      type="password"
                      name="confirm-password"
                      id="confirm-password"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              </div>
              
              <div class="flex justify-end">
                <button
                  type="submit"
                  class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Update password
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <!-- Notifications Section -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Notification Settings</h3>
            
            <div class="space-y-4">
              <div class="flex items-start">
                <div class="flex items-center h-5">
                  <input
                    id="email-notifications"
                    name="email-notifications"
                    type="checkbox"
                    checked
                    class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                </div>
                <div class="ml-3 text-sm">
                  <label for="email-notifications" class="font-medium text-gray-700">Email notifications</label>
                  <p class="text-gray-500">Receive email notifications when someone sends you a message.</p>
                </div>
              </div>
              
              <div class="flex items-start">
                <div class="flex items-center h-5">
                  <input
                    id="browser-notifications"
                    name="browser-notifications"
                    type="checkbox"
                    checked
                    class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                </div>
                <div class="ml-3 text-sm">
                  <label for="browser-notifications" class="font-medium text-gray-700">Browser notifications</label>
                  <p class="text-gray-500">Receive push notifications in your browser.</p>
                </div>
              </div>
            </div>
            
            <div class="mt-5 flex justify-end">
              <button
                type="button"
                id="save-notifications"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Save preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners after the container is added to DOM
    setTimeout(() => {
      // Profile form submission
      const profileForm = container.querySelector('#profile-form');
      const profileSuccess = container.querySelector('#profile-success');
      const profileError = container.querySelector('#profile-error');
      
      profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = profileForm.querySelector('#name').value;
        
        profileSuccess.classList.add('hidden');
        profileError.classList.add('hidden');
        
        try {
          if (this.props.onUpdateUser) {
            await this.props.onUpdateUser({ name });
            profileSuccess.classList.remove('hidden');
            
            // Hide success message after 3 seconds
            setTimeout(() => {
              profileSuccess.classList.add('hidden');
            }, 3000);
          }
        } catch (error) {
          profileError.textContent = error.message || 'Failed to update profile';
          profileError.classList.remove('hidden');
        }
      });
      
      // Password form submission
      const passwordForm = container.querySelector('#password-form');
      const passwordSuccess = container.querySelector('#password-success');
      const passwordError = container.querySelector('#password-error');
      
      passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentPassword = passwordForm.querySelector('#current-password').value;
        const newPassword = passwordForm.querySelector('#new-password').value;
        const confirmPassword = passwordForm.querySelector('#confirm-password').value;
        
        passwordSuccess.classList.add('hidden');
        passwordError.classList.add('hidden');
        
        // Validate passwords
        if (newPassword !== confirmPassword) {
          passwordError.textContent = 'New passwords do not match';
          passwordError.classList.remove('hidden');
          return;
        }
        
        try {
          if (this.props.onUpdatePassword) {
            await this.props.onUpdatePassword({
              currentPassword,
              newPassword
            });
            
            passwordSuccess.classList.remove('hidden');
            passwordForm.reset();
            
            // Hide success message after 3 seconds
            setTimeout(() => {
              passwordSuccess.classList.add('hidden');
            }, 3000);
          }
        } catch (error) {
          passwordError.textContent = error.message || 'Failed to update password';
          passwordError.classList.remove('hidden');
        }
      });
      
      // Notification settings
      const saveNotificationsButton = container.querySelector('#save-notifications');
      
      saveNotificationsButton.addEventListener('click', async () => {
        const emailNotifications = container.querySelector('#email-notifications').checked;
        const browserNotifications = container.querySelector('#browser-notifications').checked;
        
        if (this.props.onUpdateNotifications) {
          try {
            await this.props.onUpdateNotifications({
              emailNotifications,
              browserNotifications
            });
            
            alert('Notification preferences saved');
          } catch (error) {
            alert('Failed to save notification preferences');
          }
        }
      });
    }, 0);
    
    return container;
  }
}
