<template>
  <div class="p-2">
    <el-page-header @back="$router.back()">
      <template #content>
        <span>文档中心</span>
        <el-tag v-if="projectId" type="info" size="small" style="margin-left: 8px">项目ID: {{ projectId }}</el-tag>
      </template>
    </el-page-header>

    <el-card shadow="hover" style="margin-top: 16px">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['docman:document:upload']" type="primary" plain icon="Upload" @click="handleUpload">上传文档</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="documentList">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="文件名" align="center" prop="fileName" min-width="200" :show-overflow-tooltip="true" />
        <el-table-column label="来源" align="center" prop="sourceType" width="120">
          <template #default="{ row }">
            <el-tag :type="row.sourceType === 'plugin' ? 'primary' : 'info'" size="small">
              {{ row.sourceType === 'plugin' ? '插件生成' : '手动上传' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="存储路径" align="center" prop="nasPath" min-width="250" :show-overflow-tooltip="true" />
        <el-table-column label="生成时间" align="center" prop="generatedAt" width="180">
          <template #default="{ row }">
            <span>{{ proxy?.parseTime(row.generatedAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="{ row }">
            <span>{{ proxy?.parseTime(row.createTime) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <!-- 上传文档对话框 -->
    <el-dialog v-model="uploadDialog.visible" :title="uploadDialog.title" width="500px" append-to-body>
      <el-form ref="uploadFormRef" :model="uploadForm" :rules="uploadRules" label-width="80px">
        <el-form-item label="文件名" prop="fileName">
          <el-input v-model="uploadForm.fileName" placeholder="请输入文件名" />
        </el-form-item>
        <el-form-item label="存储路径" prop="nasPath">
          <el-input v-model="uploadForm.nasPath" placeholder="NAS 存储路径" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitUpload">确 定</el-button>
          <el-button @click="uploadDialog.visible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { listDocument, uploadDocument } from '@/api/docman/document';
import { DocDocumentVO, DocDocumentQuery, DocDocumentUploadForm } from '@/api/docman/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();

const projectId = ref(Number(route.query.projectId));
const documentList = ref<DocDocumentVO[]>([]);
const loading = ref(true);
const total = ref(0);

const queryParams = ref<DocDocumentQuery>({
  pageNum: 1,
  pageSize: 20,
  projectId: projectId.value
});

const uploadFormRef = ref<ElFormInstance>();
const uploadDialog = reactive<DialogOption>({ visible: false, title: '' });

const uploadForm = ref<DocDocumentUploadForm>({
  projectId: projectId.value,
  sourceType: 'upload',
  fileName: '',
  nasPath: ''
});

const uploadRules = {
  fileName: [{ required: true, message: '文件名不能为空', trigger: 'blur' }],
  nasPath: [{ required: true, message: '存储路径不能为空', trigger: 'blur' }]
};

/** 文档状态 tag 颜色映射 */
const statusType = (s: string): string => {
  const map: Record<string, string> = {
    pending: 'warning',
    running: '',
    generated: 'primary',
    failed: 'danger',
    archived: 'success',
    obsolete: 'info'
  };
  return map[s] || 'info';
};

/** 文档状态标签 */
const statusLabel = (s: string): string => {
  const map: Record<string, string> = {
    pending: '待生成',
    running: '生成中',
    generated: '已生成',
    failed: '生成失败',
    archived: '已归档',
    obsolete: '已失效'
  };
  return map[s] || s;
};

/** 查询文档列表 */
const getList = async () => {
  loading.value = true;
  const res = await listDocument(queryParams.value);
  documentList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 上传文档 */
const handleUpload = () => {
  uploadForm.value = { projectId: projectId.value, sourceType: 'upload', fileName: '', nasPath: '' };
  uploadFormRef.value?.resetFields();
  uploadDialog.visible = true;
  uploadDialog.title = '上传文档';
};

/** 提交上传 */
const submitUpload = () => {
  uploadFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      await uploadDocument(uploadForm.value);
      proxy?.$modal.msgSuccess('上传成功');
      uploadDialog.visible = false;
      await getList();
    }
  });
};

onMounted(() => {
  getList();
});
</script>
