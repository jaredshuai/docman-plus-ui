<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="项目名称" prop="name">
              <el-input v-model="queryParams.name" placeholder="请输入项目名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="客户类型" prop="customerType">
              <el-select v-model="queryParams.customerType" placeholder="全部" clearable>
                <el-option label="通信" value="telecom" />
                <el-option label="社会" value="social" />
              </el-select>
            </el-form-item>
            <el-form-item label="业务类型" prop="businessType">
              <el-select v-model="queryParams.businessType" placeholder="全部" clearable>
                <el-option label="管道" value="pipeline" />
                <el-option label="弱电" value="weak_current" />
              </el-select>
            </el-form-item>
            <el-form-item label="项目状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="全部" clearable>
                <el-option label="进行中" value="active" />
                <el-option label="已归档" value="archived" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['docman:project:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['docman:project:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()">
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['docman:project:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
              删除
            </el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="projectList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="项目名称" align="center" prop="name" min-width="200" :show-overflow-tooltip="true" />
        <el-table-column label="客户类型" align="center" prop="customerType" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ customerTypeLabel(row.customerType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="业务类型" align="center" prop="businessType" width="100">
          <template #default="{ row }">
            <el-tag type="warning" size="small">{{ businessTypeLabel(row.businessType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="文档类别" align="center" prop="documentCategory" width="110">
          <template #default="{ row }">
            {{ documentCategoryLabel(row.documentCategory) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'archived' ? 'success' : 'primary'" size="small">
              {{ row.status === 'archived' ? '已归档' : '进行中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="负责人" align="center" prop="ownerName" width="100" />
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="{ row }">
            <span>{{ proxy?.parseTime(row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" align="center" class-name="small-padding fixed-width">
          <template #default="{ row }">
            <el-tooltip content="文档" placement="top">
              <el-button link type="primary" icon="Document" @click="handleDocuments(row.id)"></el-button>
            </el-tooltip>
            <el-tooltip content="流程" placement="top">
              <el-button link type="primary" icon="SetUp" @click="handleProcess(row.id)"></el-button>
            </el-tooltip>
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['docman:project:edit']" link type="primary" icon="Edit" @click="handleUpdate(row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['docman:project:remove']" link type="primary" icon="Delete" @click="handleDelete(row)"></el-button>
            </el-tooltip>
            <el-tooltip content="归档" placement="top">
              <el-button
                v-if="row.status === 'active'"
                v-hasPermi="['docman:archive:execute']"
                link
                type="primary"
                icon="FolderChecked"
                @click="handleArchive(row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <!-- 新增/修改项目对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="600px" append-to-body>
      <el-form ref="projectFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="客户类型" prop="customerType">
              <el-select v-model="form.customerType" placeholder="请选择">
                <el-option label="通信" value="telecom" />
                <el-option label="社会" value="social" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="业务类型" prop="businessType">
              <el-select v-model="form.businessType" placeholder="请选择">
                <el-option label="管道" value="pipeline" />
                <el-option label="弱电" value="weak_current" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="文档类别" prop="documentCategory">
          <el-select v-model="form.documentCategory" placeholder="请选择">
            <el-option label="电信文档" value="telecom" />
            <el-option label="内部文档" value="internal" />
            <el-option label="客户文档" value="customer" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
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
import { listProject, getProject, addProject, updateProject, delProject } from '@/api/docman/project';
import { archiveProject } from '@/api/docman/archive';
import { DocProjectVO, DocProjectForm, DocProjectQuery } from '@/api/docman/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const router = useRouter();

const projectList = ref<DocProjectVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const projectFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: DocProjectForm = {
  id: undefined,
  name: '',
  customerType: '',
  businessType: '',
  documentCategory: '',
  remark: ''
};

const data = reactive<PageData<DocProjectForm, DocProjectQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: '',
    customerType: '',
    businessType: '',
    status: ''
  },
  rules: {
    name: [{ required: true, message: '项目名称不能为空', trigger: 'blur' }],
    customerType: [{ required: true, message: '客户类型不能为空', trigger: 'change' }],
    businessType: [{ required: true, message: '业务类型不能为空', trigger: 'change' }],
    documentCategory: [{ required: true, message: '文档类别不能为空', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 客户类型标签 */
const customerTypeLabel = (val: string) => ({ telecom: '通信', social: '社会' })[val] || val;

/** 业务类型标签 */
const businessTypeLabel = (val: string) => ({ pipeline: '管道', weak_current: '弱电' })[val] || val;

/** 文档类别标签 */
const documentCategoryLabel = (val: string) => ({ telecom: '电信文档', internal: '内部文档', customer: '客户文档' })[val] || val;

/** 查询项目列表 */
const getList = async () => {
  loading.value = true;
  const res = await listProject(queryParams.value);
  projectList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: DocProjectVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  projectFormRef.value?.resetFields();
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '新增项目';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: DocProjectVO) => {
  reset();
  const projectId = row?.id || ids.value[0];
  const { data } = await getProject(projectId);
  Object.assign(form.value, data);
  dialog.visible = true;
  dialog.title = '修改项目';
};

/** 提交按钮 */
const submitForm = () => {
  projectFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      form.value.id ? await updateProject(form.value) : await addProject(form.value);
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: DocProjectVO) => {
  const projectIds = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除所选项目？');
  await delProject(projectIds);
  await getList();
  proxy?.$modal.msgSuccess('删除成功');
};

/** 跳转文档中心 */
const handleDocuments = (id: number) => {
  router.push({ path: '/docman/document', query: { projectId: String(id) } });
};

/** 跳转流程编排 */
const handleProcess = (id: number) => {
  router.push({ path: '/docman/process', query: { projectId: String(id) } });
};

/** 归档操作 */
const handleArchive = async (row: DocProjectVO) => {
  await proxy?.$modal.confirm('确认归档项目「' + row.name + '」？归档后项目将不可修改。');
  await archiveProject(row.id);
  proxy?.$modal.msgSuccess('归档成功');
  await getList();
};

onMounted(() => {
  getList();
});
</script>
