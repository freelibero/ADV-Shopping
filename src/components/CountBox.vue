<template>
  <div class="count-box">
    <button @click="handleSub" class="minus">-</button>
    <input :value="value" @change="handleChange" class="inp" type="text">
    <button @click="handleAdd" class="add">+</button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

// 定义 props
const props = defineProps({
  value: {
    type: Number,
    default: 1
  }
});

// 定义 emits
const emit = defineEmits(['input']);

// 处理减少数量的方法
const handleSub = () => {
  if (props.value <= 1) {
    return;
  }
  emit('input', props.value - 1);
};

// 处理增加数量的方法
const handleAdd = () => {
  emit('input', props.value + 1);
};

// 处理输入框值变化的方法
const handleChange = (e) => {
  const num = +e.target.value;

  // 输入了不合法的文本 或 输入了负值，回退成原来的 value 值
  if (isNaN(num) || num < 1) {
    e.target.value = props.value;
    return;
  }

  emit('input', num);
};
</script>

<style lang="less" scoped>
.count-box {
  width: 110px;
  display: flex;

  .add,
  .minus {
    width: 30px;
    height: 30px;
    outline: none;
    border: none;
    background-color: #efefef;
  }

  .inp {
    width: 40px;
    height: 30px;
    outline: none;
    border: none;
    margin: 0 5px;
    background-color: #efefef;
    text-align: center;
  }
}
</style>
