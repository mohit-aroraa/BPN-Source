<template>
    <div class="cart__urgency-message" v-if="urgencyMessage">
        <span v-html="urgencyMessage"></span>
        <strong>{{ formattedTime }}</strong>
    </div>
</template>

<script>
export default {
    name: "CartUrgencyTimer",
    data() {
        return {
            timeLeft: 15 * 60,
            interval: null,
            urgencyMessage: "",
        };
    },
    computed: {
        formattedTime() {
            const minutes = String(Math.floor(this.timeLeft / 60)).padStart(2, "0");
            const seconds = String(this.timeLeft % 60).padStart(2, "0");
            return `${minutes}:${seconds}`;
        },
    },
    methods: {
        startCountdown() {
            this.interval = setInterval(() => {
                if (this.timeLeft > 0) {
                    this.timeLeft--;
                } else {
                    this.timeLeft = 15 * 60;
                }
            }, 1000);
        },
    },
    mounted() {
        this.urgencyMessage = window.theme.settings.message
        this.startCountdown();
    },
    beforeUnmount() {
        clearInterval(this.interval);
    },
};
</script>
