export class NotificationManager {
  constructor() {
    this.modal = document.getElementById('modal-container');
    this.modalContent = document.getElementById('modal-content');
    this.modalCloseButton = document.getElementById('modal-close');
    
    // Set up event listeners
    this.modalCloseButton.addEventListener('click', () => {
      this.hide();
    });
    
    // Close modal when clicking outside
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    });
    
    // Close modal when pressing Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hide();
      }
    });
  }
  
  // Show a notification
  show(message, type = 'info') {
    const icons = {
      success: `<svg class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>`,
      error: `<svg class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>`,
      warning: `<svg class="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>`,
      info: `<svg class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`
    };
    
    const colors = {
      success: 'bg-green-50',
      error: 'bg-red-50',
      warning: 'bg-yellow-50',
      info: 'bg-blue-50'
    };
    
    this.modalContent.innerHTML = `
      <div class="flex items-center ${colors[type] || colors.info} p-4 rounded-lg">
        <div class="flex-shrink-0">
          ${icons[type] || icons.info}
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-gray-800">${message}</p>
        </div>
      </div>
    `;
    
    this.modal.classList.remove('hidden');
    
    // Auto hide after 3 seconds for non-error notifications
    if (type !== 'error') {
      setTimeout(() => {
        this.hide();
      }, 3000);
    }
  }
  
  // Hide the notification
  hide() {
    this.modal.classList.add('hidden');
  }
}
