<template>
  <div class="panel panel-default">
    <div class="panel-heading">
      <h3 class='panel-title'>
        {{title}}
      </h3>
    </div>
    <div class="panel-body">{{content}}</div>
  </div>
</template>

<script>
export default {
  name: 'PanelDefault',
  props: {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  }
};
</script>

<style scoped>
.panel {
  margin-bottom: 20px;
  background-color: #fff;
  border: 1px solid transparent;
  border-radius: 4px;
  -webkit-box-shadow: 0 1px 1px rgba(0,0,0,.05);
  box-shadow: 0 1px 1px rgba(0,0,0,.05);
}

.panel panel-default {
  border-color: #ddd;
}

.panel .panel-heading {
  color: #333;
  background-color: #f5f5f5;
  border-color: #ddd;
  text-align: center;
}

.panel .panel-heading .panel-title {
  font-size: 14px;
}

.panel .panel-body {
  padding: 15px;
}

</style>