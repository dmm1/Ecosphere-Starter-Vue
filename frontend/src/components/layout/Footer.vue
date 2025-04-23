<template>
  <footer class="bg-white dark:bg-gray-800 shadow-inner mt-auto">
    <div class="container mx-auto px-4 py-6">
      <div class="flex flex-col md:flex-row justify-between items-center">
        <div class="mb-4 md:mb-0">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            &copy; {{ new Date().getFullYear() }} Ecosphere. All rights reserved.
          </p>
        </div>
        <div class="flex space-x-6">
          <a href="#" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            Terms
          </a>
          <a href="#" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            Privacy
          </a>
          <a href="#" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            Contact
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
