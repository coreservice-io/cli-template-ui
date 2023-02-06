<script setup>
import api from "@/api";
import useOverlayStore from "@/stores/overlay";
import { ref, computed } from "vue";
import { validator } from "@/utils/index.js";

import TopbarNavLayout from "../../layouts/topbar/TopbarNavLayout.vue";
import Divider from "../../components/core/divider/Divider.vue";

import { useToast } from "vue-toastification";

import { UserPlusIcon, CursorArrowRaysIcon } from "@heroicons/vue/24/solid";
import { EnvelopeIcon, KeyIcon, PaperAirplaneIcon, CalculatorIcon, LockClosedIcon, CheckIcon } from "@heroicons/vue/24/outline";

import captchaImgUrl from "../../assets/captcha.png";
import { useI18n } from "vue-i18n";
import lang from "./auth_lang";
const { t } = useI18n({ messages: lang });

const toast = useToast();

/////input ///////
let email = ref("");
let validate_email = computed(() => {
  return email.value == "" ? true : validator.validateEmail(email.value);
});

////
let password = ref("");
let validate_password = computed(() => {
  return password.value == "" ? true : validator.validatePassword(password.value);
});
//
let password_again = ref("");
let validate_password_again = computed(() => {
  return password.value === password_again.value;
});

//
let captcha = ref("");
//
let vcode = ref("");
//
let validate_reset_pass_ready = computed(() => {
  if (validate_email.value && email.value != "" && validate_password.value && password.value != "" && validate_password_again.value && password_again.value != "" && captcha.value !== "" && vcode.value !== "") {
    return true;
  }
  return false;
});

let validate_email_ready = computed(() => {
  if (validate_email.value && email.value != "") {
    return true;
  }
  return false;
});
////

async function submit_reset_pass() {
  if (!validate_reset_pass_ready.value) {
    return;
  }

  const overlay_store = useOverlayStore();
  overlay_store.showLoader();
  let resp = await api.user.resetPassword(email.value, password.value, captchaId, captcha.value, vcode.value);

  if (resp.err != null) {
    toast.error(resp.err);
    overlay_store.hideLoader();
    return;
  }

  if (resp.result.meta_status < 0) {
    toast.error(resp.result.meta_msg);
    overlay_store.hideLoader();
    return;
  }

  window.location = "/signin";
}

async function send_vcode() {
  if (!validate_email_ready.value) {
    toast.error("email error");
    return;
  }

  let resp = await api.user.getEmailVCode(email.value);
  // console.log(resp);
  if (resp.err !== null) {
    toast.error(resp.err);

    return;
  }
  if (resp.result.meta_status < 0) {
    toast.error(resp.result.meta_message);
    return;
  }

  toast.success("vcode send");
}

let captchaBase64 = ref("");
let captchaId = "";
async function refresh_captcha() {
  let resp = await api.captcha.getCaptcha();
  // console.log(resp);
  if (resp.err !== null) {
    console.log(resp.err);
    toast.error(resp.err);

    return;
  }
  if (resp.result.meta_status < 0) {
    toast.error(resp.result.meta_message);
    return;
  }

  captchaId = resp.result.id;
  captchaBase64 = resp.result.content;
}

/////////////////////////////////////////////
//inital loading
refresh_captcha();
</script>

<template>
  <TopbarNavLayout>
    <div class="max-w-lg m-auto items-center justify-center px-6 py-12 lg:mt-12">
      <h3 class="text-2xl text-gray-500 mb-3">{{ t("reset_pass") }}</h3>

      <div class="input-wrap">
        <div class="prefix">
          <EnvelopeIcon class="icon" />
        </div>
        <input id="email" name="email" type="email" autocomplete="email" v-model="email" :class="[validate_email ? '' : 'err', 'rounded relative pl-10']" placeholder="email" />
        <div :class="validate_email && email != '' ? 'visible' : 'invisible'" class="suffix">
          <CheckIcon class="h-5 w-5 text-success" />
        </div>
      </div>

      <div class="-space-y-px mt-3 mb-3">
        <div class="input-wrap">
          <div class="prefix">
            <LockClosedIcon class="icon" />
          </div>
          <input id="password" name="password" type="password" v-model="password" v-tippy="{ placement: 'right', content: t('password_rule'), trigger: 'focus' }" :class="[validate_password ? '' : 'err', 'relative pl-10 rounded-t']" autocomplete="current-password" :placeholder="t('password')" />

          <div :class="validate_password && password != '' ? 'visible' : 'invisible'" class="suffix">
            <CheckIcon class="h-5 w-5 text-success" />
          </div>
        </div>

        <div class="input-wrap">
          <div class="prefix">
            <LockClosedIcon class="icon" />
          </div>
          <input id="password_again" name="password_again" type="password" v-model="password_again" autocomplete="current-password" :class="[validate_password_again ? '' : 'err', 'relative pl-10 rounded-b']" :placeholder="t('password_again')" />
          <div :class="validate_password_again && password_again != '' ? 'visible' : 'invisible'" class="suffix">
            <CheckIcon class="h-5 w-5 text-success" />
          </div>
        </div>
      </div>

      <div class="btn-input-wrap mb-3">
        <div class="input-wrap">
          <div class="prefix">
            <CalculatorIcon class="icon" />
          </div>
          <input type="text" name="captcha" id="captcha" v-model="captcha" class="pl-10" :placeholder="t('input_captcha')" />
        </div>
        <div class="btn" v-tippy="{ placement: 'bottom', content: t('change_captcha') }" @click="refresh_captcha">
          <img class="captcha" v-bind:src="captchaBase64 === '' ? captchaImgUrl : captchaBase64" />
        </div>
      </div>

      <div class="btn-input-wrap">
        <div class="input-wrap">
          <div class="prefix">
            <KeyIcon class="icon" />
          </div>
          <input type="text" name="vcode" id="vcode" v-model="vcode" class="pl-10" placeholder="input your v-code" />
        </div>
        <div class="btn" v-tippy="{ placement: 'bottom', content: t('send_vcode_to_email') }" @click="send_vcode">
          <PaperAirplaneIcon /><span>{{ t("send") }}</span>
        </div>
      </div>

      <!-- <div class="btn-primary w-full relative mt-3 mb-3"><UserPlusIcon class="icon dark absolute left-3" />{{ t("submit") }}</div> -->

      <div @click="submit_reset_pass" :class="[validate_reset_pass_ready ? '' : 'disabled', ' btn-primary w-full relative mt-3 mb-3']"><UserPlusIcon class="icon dark absolute left-3" />{{ t("submit") }}</div>

      <Divider>{{ t("or") }}</Divider>

      <router-link to="/signin" class="mt-3 btn-secondary w-full relative">
        <CursorArrowRaysIcon class="icon dark absolute left-3" aria-hidden="true" />
        {{ t("sign_in_exist") }}
      </router-link>
    </div>
  </TopbarNavLayout>
</template>
