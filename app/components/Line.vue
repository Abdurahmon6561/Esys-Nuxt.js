<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import gsap from "gsap";

const path = ref("M 10 100 Q 500 100 990 100");
const finalPath = "M 10 100 Q 500 100 990 100";

const stringRef = ref(null);

function handleMouseMove(ev) {
  const newPath = `M 10 100 Q ${ev.offsetX} ${ev.offsetY} 990 100`;

  gsap.to(path, {
    value: newPath,
    duration: 0.2,
    ease: "power3.out",
    onUpdate: () => {
      // force update SVG
      path.value = gsap.getProperty(path, "value");
    }
  });
}

function handleMouseLeave() {
  gsap.to(path, {
    value: finalPath,
    duration: 1.5,
    ease: "elastic.out(1, 0.2)",
    onUpdate: () => {
      path.value = gsap.getProperty(path, "value");
    }
  });
}

onMounted(() => {
  if (stringRef.value) {
    stringRef.value.addEventListener("mousemove", handleMouseMove);
    stringRef.value.addEventListener("mouseleave", handleMouseLeave);
  }
});

onBeforeUnmount(() => {
  if (stringRef.value) {
    stringRef.value.removeEventListener("mousemove", handleMouseMove);
    stringRef.value.removeEventListener("mouseleave", handleMouseLeave);
  }
});
</script>

<template>
  <div ref="stringRef" class="w-full h-[150px] flex justify-center items-center">
    <svg width="1000" height="200">
      <path :d="path" stroke="black" fill="transparent" />
    </svg>
  </div>
</template>
