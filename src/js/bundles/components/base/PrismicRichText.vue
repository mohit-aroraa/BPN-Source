<template>
  <div>
    <template v-for="(textObj, index) in richtext">
      <p
        class="richText__text"
        :key="index"
        v-if="textObj.type === 'paragraph'"
        v-html="formattedText(textObj)"
      ></p>
      <div
        class="richText__heading1"
        data-richText-heading
        v-if="textObj.type === 'heading1'"
        :key="index"
        v-html="formattedText(textObj)"
      ></div>
      <div
        class="richText__heading2"
        data-richText-heading
        v-if="textObj.type === 'heading2'"
        :key="index"
        v-html="formattedText(textObj)"
      ></div>
      <div
        class="richText__heading3"
        data-richText-heading
        v-if="textObj.type === 'heading3'"
        :key="index"
        v-html="formattedText(textObj)"
      ></div>
      <div
        class="richText__heading4"
        data-richText-heading
        v-if="textObj.type === 'heading4'"
        :key="index"
        v-html="formattedText(textObj)"
      ></div>
      <div
        class="richText__heading5"
        data-richText-heading
        v-if="textObj.type === 'heading5'"
        :key="index"
        v-html="formattedText(textObj)"
      ></div>
      <div
        class="richText__heading6"
        data-richText-heading
        v-if="textObj.type === 'heading6'"
        :key="index"
        v-html="formattedText(textObj)"
      ></div>
      <ol
        class="richText__ol"
        v-if="textObj.type === 'o-list-item'"
        :key="index"
      >
        <li class="richText__olItem" v-html="formattedText(textObj)"></li>
      </ol>

      <ul class="richText__ul" v-if="textObj.type === 'list-item'" :key="index">
        <li class="richText__ulItem" v-html="formattedText(textObj)"></li>
      </ul>
    </template>
  </div>
</template>

<script>
export default {
  name: 'PrismicRichText',
  props: {
    richtext: {
      type: Array,
      required: true,
      default: [],
    },
  },
  methods: {
    formattedText(textObj) {
      let { text, spans } = textObj;
      let formattedText = null;
      if (spans.length) {
        const textArray = text.split('');
        for (let index = 0; index < spans.length; index++) {
          const span = spans[index];
          const { type, start, end } = span;
          const textToReplace = textArray.slice(start, end).join('');
          if (type === 'strong') {
            const markup = `<strong>${textToReplace}</strong>`;
            formattedText = text.replace(textToReplace, markup);
          } else if (type === 'em') {
            const markup = `<em>${textToReplace}</em>`;
            formattedText = text.replace(textToReplace, markup);
          } else if (type === 'hyperlink') {
            const markup = `<a class="richText__link" href="${span.data.url}" ${
              span.data.target ? `target="${span.data.target}"` : ''
            }>${textToReplace}</a>`;
            formattedText = text.replace(textToReplace, markup);
          }
        }
        return formattedText;
      } else {
        return text || '';
      }
    },
  },
};
</script>
