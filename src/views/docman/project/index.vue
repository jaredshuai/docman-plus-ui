<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="项目名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="客户类型" prop="customerType">
        <el-select v-model="queryParams.customerType" placeholder="全部" clearable>
          <el-option label="电信" value="telecom" />
          <el-option label="社会客户" value="social" />
        </el-select>
      </el-form-item>
      <el-form-item label="业务类型" prop="businessType">
        <el-select v-model="queryParams.businessType" placeholder="全部" clearable>
          <el-option label="管线" value="pipeline" />
          <el-option label="弱电" value="weak_current" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['docman:project:add']">新增项目</el-button>
      </el-col>
    </el-row>

    <el-row :gutter="16" v-loading="loading">
      <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in projectList" :key="item.id">
        <el-card shadow="hover" class="project-card" style="margin-bottom: 16px; cursor: pointer;" @click="handleDetail(item.id)">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold;">{{ item.name }}</span>
              <el-tag :type="item.status === 'archived' ? 'success' : 'primary'" size="small">
                {{ item.status === 'archived' ? '已归档' : '进行中' }}
              </el-tag>
            </div>
          </template>
          <p>客户：{{ item.customerType === 'telecom' ? '电信' : '社会客户' }}</p>
          <p>类型：{{ item.businessType === 'pipeline' ? '管线' : '弱电' }}</p>
          <p>负责人：{{ item.ownerName }}</p>
          <template #footer>
            <el-button size="small" @click.stop="handleDocuments(item.id)">文档中心</el-button>
            <el-button size="small" type="warning" @click.stop="handleProcess(item.id)">流程</el-button>
            <el-button size="small" type="success" v-if="item.status === 'active'" @click.stop="handleArchive(item.id)" v-hasPermi="['docman:archive:execute']">归档</el-button>
          </template>
        </el-card>
      </el-col>
    </el-row>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改项目配置对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="projectFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="客户类型" prop="customerType">
          <el-select v-model="form.customerType" placeholder="请选择客户类型" style="width: 100%">
            <el-option label="电信" value="telecom" />
            <el-option label="社会客户" value="social" />
          </el-select>
        </el-form-item>
        <el-form-item label="业务类型" prop="businessType">
          <el-select v-model="form.businessType" placeholder="请选择业务类型" style="width: 100%">
            <el-option label="管线" value="pipeline" />
            <el-option label="弱电" value="weak_current" />
          </el-select>
        </el-form-item>
        <el-form-item label="文档分类" prop="documentCategory">
          <el-input v-model="form.documentCategory" placeholder="请输入文档分类" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, toRefs, getCurrentInstance, ComponentInternalInstance } from 'vue';
import { useRouter } from 'vue-router';
import { listProject, addProject } from '@/api/docman/project';
import { archiveProject } from '@/api/docman/archive';
import { DocProject, DocProjectQuery, DocProjectForm, PageResult } from '@/api/docman/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const router = useRouter();

const projectList = ref<DocProject[]>([]);
const total = ref(0);
const loading = ref(true);

const queryRef = ref<ElFormInstance>();
const projectFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: DocProjectForm = {
  name: '',
  customerType: 'telecom',
  businessType: 'pipeline',
  documentCategory: '',
  remark: ''
};

const data = reactive({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 12,
    name: '',
    customerType: '',
    businessType: ''
  } as DocProjectQuery,
  rules: {
    name: [{ required: true, message: '项目名称不能为空', trigger: 'blur' }],
    customerType: [{ required: true, message: '客户类型不能为空', trigger: 'change' }],
    businessType: [{ required: true, message: '业务类型不能为空', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询项目列表 */
const getList = async () => {
  loading.value = true;
  const res = await listProject(queryParams.value);
  projectList.value = res.data.rows;
  total.value = res.data.total;
  loading.value = false;
};

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  queryRef.value?.resetFields();
  handleQuery();
}

/** 重置操作表单 */
function reset() {
  form.value = { ...initFormData };
  projectFormRef.value?.resetFields();
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  dialog.visible = true;
  dialog.title = '新增项目';
}

/** 取消按钮 */
function cancel() {
  dialog.visible = false;
  reset();
}

/** 提交按钮 */
const submitForm = () => {
  projectFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      await addProject(form.value);
      proxy?.$modal.msgSuccess('新增成功');
      dialog.visible = false;
      getList();
    }
  });
};

function handleDetail(id: number) { router.push({ path: '/docman/document', query: { projectId: String(id) } }); }
function handleDocuments(id: number) { router.push({ path: '/docman/document', query: { projectId: String(id) } }); }
function handleProcess(id: number) { router.push({ path: '/docman/process', query: { projectId: String(id) } }); }

/** 归档按钮操作 */
function handleArchive(id: number) {
  proxy?.$modal.confirm('确认归档该项目？归档后不可修改。').then(async () => {
    await archiveProject(id);
    proxy?.$modal.msgSuccess('归档成功');
    getList();
  }).catch(() => {});
}

onMounted(() => getList());
</script>
