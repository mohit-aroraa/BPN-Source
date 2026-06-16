<template>
  <svg
    :width="`${width}px`"
    :height="`${height}px`"
    viewBox="0 0 10 10"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
  >
    <title>Path</title>
    <g
      id="⚙️-Symbols"
      stroke="none"
      stroke-width="1"
      fill="none"
      fill-rule="evenodd"
    >
      <g
        id="Elements/Icons/Close"
        transform="translate(-7.000000, -7.000000)"
        fill="#555555"
      >
        <polygon
          points="17 8.42857143 13.4285714 12 17 15.5714286 15.5714286 17 12 13.4285714 8.42857143 17 7 15.5714286 10.5714286 12 7 8.42857143 8.42857143 7 12 10.5714286 15.5714286 7"
        ></polygon>
      </g>
    </g>
  </svg>
</template>

<script>
export default {
  props: {
    width: {
      type: Number,
      default: 10,
    },

    height: {
      type: Number,
      default: 10,
    },
  },
};
</script>
