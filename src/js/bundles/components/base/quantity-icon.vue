<template>
  <svg
    v-if="iconType === 'minus'"
    :width="width"
    :height="height"
    viewBox="0 0 10 2"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
  >
    <title>minus</title>
    <g stroke="none"
       stroke-width="1"
       fill="none"
       fill-rule="evenodd"
    >
      <g transform="translate(-1211.000000, -219.000000)" fill="#555555">
        <g transform="translate(1064.000000, 1.000000)">
          <g transform="translate(16.000000, 147.000000)">
            <g transform="translate(115.000000, 56.000000)">
              <g transform="translate(16.000000, 15.500000)">
                <rect x="0"
                      y="0"
                      width="10"
                      height="1"
                ></rect>
              </g>
            </g>
          </g>
        </g>
      </g>
    </g>
  </svg>
  <svg
    v-else
    :width="width"
    :height="height"
    viewBox="0 0 10 10"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
  >
    <title>plus</title>
    <g stroke="none"
       stroke-width="1"
       fill="none"
       fill-rule="evenodd"
    >
      <g transform="translate(-1275.000000, -215.000000)" fill="#555555">
        <g transform="translate(1064.000000, 1.000000)">
          <g transform="translate(16.000000, 147.000000)">
            <g transform="translate(115.000000, 56.000000)">
              <g transform="translate(80.000000, 11.000000)">
                <rect x="0"
                      y="4.5"
                      width="10"
                      height="1"
                ></rect>
                <rect x="4.5"
                      y="0"
                      width="1"
                      height="10"
                ></rect>
              </g>
            </g>
          </g>
        </g>
      </g>
    </g>
  </svg>
</template>

<script>
export default {
  props: {
    width: {
      type: String,
      default: '10px',
    },

    height: {
      type: String,
      default: '10px',
    },

    iconType: {
      type: String,
      default: 'minus',
    },
  },
};
</script>
