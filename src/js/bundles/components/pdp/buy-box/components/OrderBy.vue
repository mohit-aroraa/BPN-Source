<template>
    <div v-if="!isSaturday" class="order-by show">
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M27.5165 8.7901L19.2461 6.04343C19.0999 5.98552 18.9376 5.98552 18.7913 6.04343L10.5209 8.7901C10.2366 8.87765 10.0383 9.16691 10.0383 9.48535V20.5287C10.0383 20.8471 10.2366 21.1072 10.5209 21.2231L18.7913 23.9697C18.8649 23.9936 18.9421 24.0035 19.0191 23.9989C19.1035 23.9989 19.1609 23.9989 19.247 23.9697L27.5165 21.1939C27.8009 21.108 28 20.8179 28 20.5003V9.48449C28 9.1669 27.8009 8.90597 27.5165 8.79096V8.7901ZM18.3087 22.2934L11.4591 20.0102V10.4664L14.187 11.3625V16.77C14.187 17.1743 14.5 17.4927 14.8983 17.4927C15.2957 17.4927 15.6087 17.1752 15.6087 16.7692V11.8543L18.3365 12.7504V22.2917H18.3087V22.2934ZM19.0191 11.4801L17.087 10.8449L18.4505 10.3531C18.82 10.2081 19.0191 9.80379 18.8765 9.42784C18.7348 9.05189 18.3365 8.87851 17.967 8.99352L14.927 10.1205L13.0226 9.48535L19.02 7.48972L25.0165 9.48449L19.02 11.4793L19.0191 11.4801ZM26.5791 20.0094L23.8504 20.9055V17.7829C23.8513 17.6877 23.8336 17.5933 23.7982 17.5052C23.7628 17.4171 23.7105 17.3371 23.6444 17.2698C23.5782 17.2025 23.4995 17.1493 23.4129 17.1133C23.3263 17.0773 23.2336 17.0592 23.14 17.0601C22.7418 17.0601 22.4583 17.3777 22.4583 17.7829V21.3973L19.7296 22.2934V12.7513L26.5791 10.4681V20.0094ZM6.74091 10.2656H1.71048C1.617 10.2647 1.52429 10.2827 1.43774 10.3186C1.35119 10.3546 1.27256 10.4077 1.20642 10.4749C1.14028 10.5421 1.08796 10.622 1.05253 10.71C1.0171 10.798 0.999252 10.8923 1.00004 10.9874C1.00004 11.3917 1.31223 11.7101 1.71048 11.7101H6.74091C7.13916 11.7101 7.45134 11.3926 7.45134 10.9874C7.4235 10.5823 7.11047 10.2656 6.74091 10.2656ZM6.74091 14.2834H1.71048C1.61686 14.2825 1.524 14.3006 1.43734 14.3367C1.35069 14.3727 1.27197 14.426 1.20581 14.4934C1.13965 14.5607 1.08737 14.6409 1.05204 14.7291C1.0167 14.8173 0.999027 14.9118 1.00004 15.007C1.00004 15.4113 1.31223 15.7297 1.71048 15.7297H6.74091C7.13916 15.7297 7.45134 15.4121 7.45134 15.007C7.4483 14.8163 7.37248 14.6343 7.2399 14.4994C7.10732 14.3645 6.92838 14.2874 6.74091 14.2843V14.2834ZM6.74091 18.303H1.71048C1.61693 18.3021 1.52414 18.3202 1.43754 18.3561C1.35094 18.3921 1.27226 18.4453 1.20611 18.5126C1.13996 18.5799 1.08767 18.66 1.05228 18.7481C1.0169 18.8362 0.99914 18.9306 1.00004 19.0257C1.00004 19.43 1.31223 19.7484 1.71048 19.7484H6.74091C7.13916 19.7484 7.45134 19.4309 7.45134 19.0257C7.4483 18.835 7.37248 18.653 7.2399 18.5181C7.10732 18.3832 6.92838 18.3061 6.74091 18.303Z"
                fill="black" />
        </svg>

        <p v-if="showCountdown">
            Order within <b>{{ countdown }}</b>. Ships <strong>TODAY</strong>
        </p>

        <p v-else>
            Order <strong>TODAY</strong>. Ships <strong>TOMORROW</strong>
        </p>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';


const now = ref(new Date());
let tickInterval = null;


const day = computed(() => now.value.getDay());
const hour = computed(() => now.value.getHours());

const isSaturday = computed(() => day.value === 6);
const isSunday = computed(() => day.value === 0);
const isBeforeNoon = computed(() => hour.value < 12);

const countdown = computed(() => {
    const noon = new Date(now.value);
    noon.setHours(12, 0, 0, 0);
    const diff = noon - now.value;
    if (diff <= 0) return null;

    const h = Math.floor(diff / 1000 / 60 / 60);
    const m = Math.floor((diff / 1000 / 60) % 60);
    const s = Math.floor((diff / 1000) % 60);

    return `${h}h ${m}m ${s}s`;
});


const showCountdown = computed(
    () => !isSunday.value && isBeforeNoon.value && countdown.value !== null
);

onMounted(() => {
    tickInterval = setInterval(() => { now.value = new Date(); }, 1000);
});

onUnmounted(() => {
    clearInterval(tickInterval);
});
</script>

<style scoped>
.order-by {
    display: none;
    align-items: center;
    justify-content: center;
    padding: 10px 0 20px;
    gap: 5px;

    &.show {
        display: flex;
    }

    @media screen and (max-width: 768px) {
        padding: 15px 0 5px;
    }

    p {
        text-align: center;
        margin: 0;
        font-weight: 500;
        font-size: 16px;

        b {
            color: #ff4438;
            font-weight: 800;
        }

        @media screen and (max-width: 768px) {
            font-size: 14px;
        }
    }
}
</style>
