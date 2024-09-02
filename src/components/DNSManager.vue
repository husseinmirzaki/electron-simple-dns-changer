<template>
  <h1 class="text-center">Simple DNS Manager</h1>
  <div class="d-flex flex-column gap-2 w-100">
    <input type="text" v-model="name" placeholder="DNS Name"
           class="form-control text-center w-100"/>
    <input type="text" v-model="dns" placeholder="Comma Sep DNS"
           class="form-control text-center w-100"/>
    <template v-if="!editItem">
      <button class="btn btn-success" @click="createOnline"
              :disabled="!canCreate">Create
      </button>
    </template>
    <template v-else>
      <div class="d-flex gap-2">
        <button class="btn btn-success w-100" @click="updateOnline"
                :disabled="!canCreate">Save
        </button>
        <button class="btn btn-danger w-100" @click="cancelUpdate">Cancel
        </button>
      </div>
    </template>
  </div>
  <div class="d-flex flex-column gap-2 w-100">
    <button class="btn btn-dark" @click="setDefaultOnline">Default</button>
    <template v-for="(item, index) in data" :key="index">
      <div class="d-flex gap-1">
        <button
            @click="setDns(item, index)"
            class="btn w-100"
            :class="{
            'btn-warning': item.found,
            'btn-primary': !item.found,
          }"
        >{{ item.name }}
        </button>
        <button class="btn btn-info" @click="setFields(item)">Edit</button>
      </div>
    </template>
  </div>

</template>
<script setup lang="ts">

import {computed, onMounted, ref} from "vue";
import {Connection} from "../Connection";

const data = ref([]);
const activeIndex = ref(-1);
const name = ref("");
const dns = ref("");
const editItem = ref();

const cancelUpdate = () => {
  editItem.value = null;
  name.value = "";
  dns.value = "";
}
const setFields = (item) => {
  name.value = item.name;
  dns.value = item.dns;
  editItem.value = item;
}
const canCreate = computed(() => {
  return name.value.length > 0 && dns.value.split(",").length > 1;
});

const updateOnline = async () => {
  await Connection.invoke("dns-manager", {
    request: "update",
    data: {
      id: editItem.value.id,
      name: name.value,
      dns: dns.value,
    }
  });
  cancelUpdate();
  await listOnline();
}
const createOnline = async () => {
  await Connection.invoke("dns-manager", {
    request: "create",
    data: {
      name: name.value,
      dns: dns.value,
    }
  });
  await listOnline();
}

const listOnline = async () => {
  data.value = await Connection.invoke("dns-manager", {
    request: "list",
  });
}

const setDefaultOnline = async () => {
  await Connection.invoke("dns-manager", {
    request: "set",
    data: {
      id: -1,
    },
  });
  await listOnline();
}
const setDns = async (item, index) => {
  const response = await Connection.invoke("dns-manager", {
    request: "set",
    data: {
      id: item['id'],
    },
  });

  if (response) {
    activeIndex.value = index;
  }
  await listOnline();
}

onMounted(() => listOnline());
</script>