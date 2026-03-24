<template>
  <el-dialog v-model="visible" draggable title="流程干预" :width="props.width" :height="props.height" :close-on-click-modal="false">
    <el-alert v-if="loadError" :title="loadError" type="warning" show-icon :closable="false" class="mb-[10px]" />
    <el-descriptions v-loading="loading" class="margin-top" :title="`${task.flowName}(${task.flowCode})`" :column="2" border>
      <el-descriptions-item label="任务名称">{{ task.nodeName }}</el-descriptions-item>
      <el-descriptions-item label="节点编码">{{ task.nodeCode }}</el-descriptions-item>
      <el-descriptions-item label="开始时间">{{ task.createTime }}</el-descriptions-item>
      <el-descriptions-item label="流程实例ID">{{ task.instanceId }}</el-descriptions-item>
      <el-descriptions-item label="版本号">{{ task.version }}.0</el-descriptions-item>
      <el-descriptions-item label="业务ID">{{ task.businessId }}</el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <span class="dialog-footer">
        <el-button v-if="task.flowStatus === 'waiting'" :disabled="buttonDisabled" type="primary" @click="openTransferTask"> 转办 </el-button>
        <el-button
          v-if="task.flowStatus === 'waiting' && Number(task.nodeRatio) > 0"
          :disabled="buttonDisabled"
          type="primary"
          @click="openMultiInstanceUser"
        >
          加签
        </el-button>
        <el-button
          v-if="task.flowStatus === 'waiting' && Number(task.nodeRatio) > 0"
          :disabled="buttonDisabled"
          type="primary"
          @click="handleTaskUser"
        >
          减签
        </el-button>
        <el-button v-if="task.flowStatus === 'waiting'" :disabled="buttonDisabled" type="danger" @click="handleTerminationTask"> 终止 </el-button>
      </span>
    </template>
    <!-- 转办 -->
    <UserSelect ref="transferTaskRef" :multiple="false" @confirm-call-back="handleTransferTask"></UserSelect>
    <!-- 加签组件 -->
    <UserSelect ref="multiInstanceUserRef" :multiple="true" @confirm-call-back="addMultiInstanceUser"></UserSelect>
    <el-dialog v-model="deleteSignatureVisible" draggable title="减签人员" width="700px" height="400px" append-to-body :close-on-click-modal="false"
      ><div>
        <el-table :data="deleteUserList" border>
          <el-table-column prop="nodeName" label="任务名称" />
          <el-table-column prop="nickName" label="办理人" />
          <el-table-column label="操作" align="center" width="160">
            <template #default="scope">
              <el-button type="danger" size="small" icon="Delete" @click="deleteMultiInstanceUser(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </el-dialog>
</template>
<script setup lang="ts">
import { propTypes } from '@/utils/propTypes';
import { FlowTaskVO, TaskOperationBo } from '@/api/workflow/task/types';
import UserSelect from '@/components/UserSelect';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
import { getTask, taskOperation, currentTaskAllUser, terminationTask } from '@/api/workflow/task';
import { ElMessage } from 'element-plus';
import { handleApiError } from '@/utils/error';
const props = defineProps({
  width: propTypes.string.def('50%'),
  height: propTypes.string.def('100%')
});
const emits = defineEmits(['submitCallback']);
const transferTaskRef = ref<InstanceType<typeof UserSelect>>();
const multiInstanceUserRef = ref<InstanceType<typeof UserSelect>>();
//遮罩层
const loading = ref(true);
//按钮
const buttonDisabled = ref(true);
const visible = ref(false);
const loadError = ref('');
//减签弹窗
const deleteSignatureVisible = ref(false);
//可减签的人员
const deleteUserList = ref<any>([]);
//任务
const task = ref<FlowTaskVO>({
  id: undefined,
  createTime: undefined,
  updateTime: undefined,
  tenantId: undefined,
  definitionId: undefined,
  instanceId: undefined,
  flowName: undefined,
  businessId: undefined,
  nodeCode: undefined,
  nodeName: undefined,
  flowCode: undefined,
  flowStatus: undefined,
  formCustom: undefined,
  formPath: undefined,
  nodeType: undefined,
  nodeRatio: undefined,
  version: undefined,
  applyNode: undefined,
  buttonList: []
});

const open = (taskId: string) => {
  visible.value = true;
  loading.value = true;
  buttonDisabled.value = true;
  loadError.value = '';
  getTask(taskId)
    .then((response) => {
      task.value = response.data;
      buttonDisabled.value = false;
    })
    .catch((error) => {
      buttonDisabled.value = false;
      loadError.value = handleApiError(error, '流程干预数据加载失败，请关闭后重试');
    })
    .finally(() => {
      loading.value = false;
    });
};

//打开转办
const openTransferTask = () => {
  transferTaskRef.value.open();
};
//转办
const handleTransferTask = async (data) => {
  if (data && data.length > 0) {
    const taskOperationBo = reactive<TaskOperationBo>({
      userId: data[0].userId,
      taskId: task.value.id,
      message: ''
    });
    await proxy?.$modal.confirm('是否确认提交？');
    loading.value = true;
    buttonDisabled.value = true;
    try {
      await taskOperation(taskOperationBo, 'transferTask');
      visible.value = false;
      emits('submitCallback');
      proxy?.$modal.msgSuccess('操作成功');
    } catch (error) {
      handleApiError(error, '转办失败，请稍后重试');
    } finally {
      loading.value = false;
      buttonDisabled.value = false;
    }
  } else {
    proxy?.$modal.msgWarning('请选择用户！');
  }
};
//加签
const openMultiInstanceUser = async () => {
  multiInstanceUserRef.value.open();
};
//加签
const addMultiInstanceUser = async (data) => {
  if (data && data.length > 0) {
    const taskOperationBo = reactive<TaskOperationBo>({
      userIds: data.map((e) => e.userId),
      taskId: task.value.id,
      message: ''
    });
    await proxy?.$modal.confirm('是否确认提交？');
    loading.value = true;
    buttonDisabled.value = true;
    try {
      await taskOperation(taskOperationBo, 'addSignature');
      visible.value = false;
      emits('submitCallback');
      proxy?.$modal.msgSuccess('操作成功');
    } catch (error) {
      handleApiError(error, '加签失败，请稍后重试');
    } finally {
      loading.value = false;
      buttonDisabled.value = false;
    }
  } else {
    proxy?.$modal.msgWarning('请选择用户！');
  }
};
//减签
const deleteMultiInstanceUser = async (row) => {
  await proxy?.$modal.confirm('是否确认提交？');
  loading.value = true;
  buttonDisabled.value = true;
  const taskOperationBo = reactive<TaskOperationBo>({
    userIds: [row.userId],
    taskId: task.value.id,
    message: ''
  });
  try {
    await taskOperation(taskOperationBo, 'reductionSignature');
    visible.value = false;
    emits('submitCallback');
    proxy?.$modal.msgSuccess('操作成功');
  } catch (error) {
    handleApiError(error, '减签失败，请稍后重试');
  } finally {
    loading.value = false;
    buttonDisabled.value = false;
  }
};
//获取办理人
const handleTaskUser = async () => {
  try {
    const data = await currentTaskAllUser(task.value.id);
    deleteUserList.value = data.data;
    if (deleteUserList.value && deleteUserList.value.length > 0) {
      deleteUserList.value.forEach((e) => {
        e.nodeName = task.value.nodeName;
      });
    }
    deleteSignatureVisible.value = true;
  } catch (error) {
    deleteUserList.value = [];
    handleApiError(error, '减签人员加载失败，请稍后重试');
  }
};

//终止任务
const handleTerminationTask = async () => {
  const params = {
    taskId: task.value.id,
    comment: ''
  };
  await proxy?.$modal.confirm('是否确认终止？');
  loading.value = true;
  buttonDisabled.value = true;
  try {
    await terminationTask(params);
    visible.value = false;
    emits('submitCallback');
    proxy?.$modal.msgSuccess('操作成功');
  } catch (error) {
    handleApiError(error, '终止失败，请稍后重试');
  } finally {
    loading.value = false;
    buttonDisabled.value = false;
  }
};
/**
 * 对外暴露子组件方法
 */
defineExpose({
  open
});
</script>
