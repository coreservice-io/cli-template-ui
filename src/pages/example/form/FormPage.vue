<script setup>
import SidebarLayout from "../../../layouts/sidebar/SidebarLayout.vue";
import { PaperClipIcon } from "@heroicons/vue/24/outline";
</script>

<template>
  <SidebarLayout>
    <form class="space-y-8 divide-y divide-gray-200 divide-gray-200">
      <div>
        <h1 class="text-2xl leading-6">Profile</h1>
        <p class="mt-3">This information will be displayed publicly so be careful what you share.</p>
      </div>

      <div class="pt-5 lg:grid lg:grid-cols-3 lg:gap-4">
        <div>
          <label for="username" class="flex">Email</label>
          <p>this is the email description if the length of the text</p>
        </div>
        <div class="lg:col-span-2 mt-2">
          <div class="input-wrap">
            <div class="prefix">http://</div>
            <input type="text" name="company-website" id="company-website" class="rounded pl-14" placeholder="www.example.com" />
          </div>
        </div>
      </div>

      <div class="pt-5 lg:grid lg:grid-cols-3 lg:gap-4">
        <div>
          <label for="username" class="flex">About</label>
          <p>this is the about description</p>
        </div>
        <div class="lg:col-span-2 mt-2">
          <textarea id="about" name="about" rows="3" class="rounded" />
        </div>
      </div>

      <div class="pt-5 lg:grid lg:grid-cols-3 lg:gap-4">
        <div>
          <label for="username" class="flex">Card with new style</label>
          <p>style for create/add</p>
        </div>
        <div class="lg:col-span-2 mt-2">
          <div class="card-new justify-center text-center p-6">
            <div class="btn-secondary sm"><PaperClipIcon class="icon mr-2"></PaperClipIcon>Upload a file</div>
            <p class="text-sm mt-2">or drag and drop PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
      </div>
    </form>
  </SidebarLayout>
</template>
