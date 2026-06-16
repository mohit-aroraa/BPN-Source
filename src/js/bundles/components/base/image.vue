<template>
  <IntersectionObserver :options="{ rootMargin: '200px' }" @enter="onEnter">
    <picture class="picture">
      <source
        v-for="(source, index) in sourceSet"
        ref="sources"
        :key="index + source.media"
        :media="source.media"
        :sizes="source.sizes || sizes"
        :data-srcset="srcset"
      />
      <img
        class="img"
        :style="{ 'object-fit': objectFit }"
        src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        :alt="altText"
        :width="width"
        :height="height"
      />
    </picture>
  </IntersectionObserver>
</template>

<script>
import IntersectionObserver from './io';
import url from 'url';

export default {
  name: 'base-image',
  components: {
    IntersectionObserver,
  },

  props: {
    image: {
      type: Object,
      required: true,
    },

    objectFit: {
      type: String,
      default: 'contain',
    },

    sizes: {
      type: String,
      default: '',
    },

    widthParam: {
      type: String,
      default: 'width',
    },
    title: {
      type: String,
      default: '',
    },
    width: {
      type: String,
      default: '',
    },
    height: {
      type: String,
      default: '',
    },
  },

  computed: {
    sourceSet() {
      return [
        {
          media: '(min-width: 0)',
          image: this.mainImage,
        },
      ];
    },

    mainImage() {
      return typeof this.image === 'string' ? { url: this.image } : this.image;
    },

    aspectRatio() {
      const image = this.mainImage;
      if (image.height || image.dimensions) {
        const height = image.height || image.dimensions.height;
        const width = image.width || image.dimensions.width;

        let ratio = 100;
        if (height) {
          ratio = (height / width) * 100;
        } else {
          ratio = parseInt(this.getAspect()) * 100;
        }

        return ratio.toFixed(4) + '%';
      } else {
        return '100%';
      }
    },

    srcset() {
      const image = this.mainImage;
      if (!this.getWidth(image)) {return [];}
      const res = this.generateRes(16, 100, this.getWidth(image));

      return res.reduce((srcset, res) => {
        srcset.push(
          this.appendParam(this.mainsrc(image), this.widthParam, res) +
            ` ${res}w`,
        );
        return srcset;
      }, []);
    },

    altText() {
      const { image, title } = this;
      let alt = image.alt;
      if (
        (alt && alt.includes('@exclude')) ||
        (alt && alt.includes('@exclude-plp')) ||
        !alt
      ) {
        alt = title;
      }

      return alt;
    },
  },

  watch: {
    image() {
      this.$nextTick(() => {
        this.updateSrcset();
      });
    },
  },

  methods: {
    onEnter(observer) {
      observer.disconnect();
      this.updateSrcset();
    },

    getAspect() {
      return this.image.aspect_ratio || this.image.aspectRatio;
    },

    updateSrcset() {
      this.$refs.sources.forEach((source) => {
        const srcset = source.dataset.srcset;
        source.srcset = srcset;
      });
    },

    mainsrc() {
      const image = this.image;
      return image.url || image.src || image.original_src || '';
    },

    getWidth() {
      const image = this.image;
      return image.width || 2000;
    },

    getHeight() {
      const image = this.image;
      return image.height || 2000;
    },

    generateRes(inc, start, end) {
      let i = 0;
      let res = [start];

      while (start < end) {
        start += inc + i;
        i += 0.5;
        inc = inc + i;

        res.push(Math.floor(start));
      }

      if (start > end) {res[res.length - 1] = end;}
      else {res.push(end);}

      return res;
    },

    appendParam(src, name, value) {
      const URL = url.parse(src);
      const char = URL.query ? '&' : '?';
      // eslint-disable-next-line no-return-assign
      return (src += `${char}${name}=${value}`);
    },
  },
};
</script>
