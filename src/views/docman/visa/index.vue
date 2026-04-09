<template>
  <div class="app-container" data-testid="visa-page">
    <el-page-header @back="router.back()">
      <template #content>签证单</template>
    </el-page-header>

    <el-card style="margin-top: 16px" data-testid="visa-form-card">
      <template #header>
        <span>新建签证单</span>
      </template>
      <el-form ref="visaFormRef" :model="form" :rules="rules" label-width="100px" data-testid="visa-form">
        <el-form-item label="事由" prop="reason">
          <el-input v-model="form.reason" placeholder="请输入事由" />
        </el-form-item>
        <el-form-item label="日期" prop="date">
          <el-date-picker v-model="form.date" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input v-model="form.amount" placeholder="请输入金额" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注内容" />
        </el-form-item>
        <el-form-item label="创建时间">
          <span>{{ form.createTime }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" data-testid="visa-submit-button" @click="submitForm">确 定</el-button>
          <el-button @click="resetForm">重 置</el-button>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { handleApiError } from '@/utils/error';

const route = useRoute();
const router = useRouter();

const projectId = ref(Number(route.params.projectId));
const visaFormRef = ref();

const initFormData = {
  reason: '',
  date: '',
  amount: '',
  remark: '',
  createTime: new Date().toLocaleString('zh-CN')
};

const form = reactive({ ...initFormData });

const rules = {
  reason: [{ required: true, message: '事由不能为空', trigger: 'blur' }],
  date: [{ required: true, message: '日期不能为空', trigger: 'change' }],
  amount: [{ required: true, message: '金额不能为空', trigger: 'blur' }]
};

function submitForm() {
  visaFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      try {
        // TODO: 调用签证单保存接口
        console.log('提交签证单:', { ...form, projectId: projectId.value });
        ElMessage.success('签证单提交成功');
        router.back();
      } catch (error) {
        handleApiError(error, '提交失败，请重试');
      }
    }
  });
}

function resetForm() {
  Object.assign(form, initFormData);
  form.createTime = new Date().toLocaleString('zh-CN');
}
</script>
