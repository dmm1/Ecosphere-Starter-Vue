<template>
  <div class="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="text-center">
      <h1 class="text-9xl font-bold text-primary-600 dark:text-primary-400">404</h1>
      <h2 class="mt-4 text-3xl font-semibold text-gray-900 dark:text-white">Page not found</h2>
      <p class="mt-6 text-base text-gray-600 dark:text-gray-400">Sorry, we couldn't find the page you're looking for.</p>
      <div class="mt-10">
        <router-link to="/" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
          Go back home
        </router-link>
      </div>
    </div>
  </div>
</template>