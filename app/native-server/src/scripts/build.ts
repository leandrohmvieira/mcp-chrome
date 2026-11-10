import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const distDir = path.join(__dirname, '..', '..', 'dist');
// 清理上次构建
console.log('Limpando o build anterior...');
try {
  fs.rmSync(distDir, { recursive: true, force: true });
} catch (err) {
  // 忽略目录不存在的错误
  console.log(err);
}

// 创建dist目录
fs.mkdirSync(distDir, { recursive: true });
fs.mkdirSync(path.join(distDir, 'logs'), { recursive: true }); // 创建logs目录
console.log('Diretórios dist e dist/logs criados/confirmados');

// 编译TypeScript
console.log('Compilando TypeScript...');
execSync('tsc', { stdio: 'inherit' });

// 复制配置文件
console.log('Copiando arquivo de configuração...');
const configSourcePath = path.join(__dirname, '..', 'mcp', 'stdio-config.json');
const configDestPath = path.join(distDir, 'mcp', 'stdio-config.json');

try {
  // 确保目标目录存在
  fs.mkdirSync(path.dirname(configDestPath), { recursive: true });

  if (fs.existsSync(configSourcePath)) {
    fs.copyFileSync(configSourcePath, configDestPath);
    console.log(`stdio-config.json copiado para ${configDestPath}`);
  } else {
    console.error(`Erro: arquivo de configuração não encontrado: ${configSourcePath}`);
  }
} catch (error) {
  console.error('Erro ao copiar o arquivo de configuração:', error);
}

// 复制package.json并更新其内容
console.log('Preparando package.json...');
const packageJson = require('../../package.json');

// 创建安装说明
const readmeContent = `# ${packageJson.name}

Este programa é o host de Native Messaging da extensão do Chrome.

## Instalação

Use o instalador do fork mantido (github.com/leandrohmvieira/mcp-chrome), que instala este host e a extensão:

- Windows: \`irm https://raw.githubusercontent.com/leandrohmvieira/mcp-chrome/main/scripts/install.ps1 | iex\`
- macOS / Linux: \`curl -fsSL https://raw.githubusercontent.com/leandrohmvieira/mcp-chrome/main/scripts/install.sh | bash\`

Não use \`npm install -g ${packageJson.name}\` do registro npm: lá está a versão antiga e abandonada do upstream.

Se o registro do host de Native Messaging falhar:
   \`\`\`
   # Instalação no nível do usuário (recomendado)
   ${packageJson.name} register

   # Se a instalação no nível do usuário falhar, tente no nível do sistema
   ${packageJson.name} register --system
   # Ou use permissões de administrador
   sudo ${packageJson.name} register
   \`\`\`

## Uso

Este aplicativo é iniciado automaticamente pela extensão do Chrome; não é preciso executá-lo manualmente.
`;

fs.writeFileSync(path.join(distDir, 'README.md'), readmeContent);

console.log('Copiando os scripts wrapper...');
const scriptsSourceDir = path.join(__dirname, '.');
const macOsWrapperSourcePath = path.join(scriptsSourceDir, 'run_host.sh');
const windowsWrapperSourcePath = path.join(scriptsSourceDir, 'run_host.bat');

const macOsWrapperDestPath = path.join(distDir, 'run_host.sh');
const windowsWrapperDestPath = path.join(distDir, 'run_host.bat');

try {
  if (fs.existsSync(macOsWrapperSourcePath)) {
    fs.copyFileSync(macOsWrapperSourcePath, macOsWrapperDestPath);
    console.log(`${macOsWrapperSourcePath} copiado para ${macOsWrapperDestPath}`);
  } else {
    console.error(`Erro: script wrapper do macOS não encontrado: ${macOsWrapperSourcePath}`);
  }

  if (fs.existsSync(windowsWrapperSourcePath)) {
    fs.copyFileSync(windowsWrapperSourcePath, windowsWrapperDestPath);
    console.log(`${windowsWrapperSourcePath} copiado para ${windowsWrapperDestPath}`);
  } else {
    console.error(`Erro: script wrapper do Windows não encontrado: ${windowsWrapperSourcePath}`);
  }
} catch (error) {
  console.error('Erro ao copiar os scripts wrapper:', error);
}

// 为关键JavaScript文件和macOS包装脚本添加可执行权限
console.log('Adicionando permissão de execução...');
const filesToMakeExecutable = ['index.js', 'cli.js', 'run_host.sh']; // cli.js 假设在 dist 根目录

filesToMakeExecutable.forEach((file) => {
  const filePath = path.join(distDir, file); // filePath 现在是目标路径
  try {
    if (fs.existsSync(filePath)) {
      fs.chmodSync(filePath, '755');
      console.log(`Permissão de execução (755) adicionada a ${file}`);
    } else {
      console.warn(`Aviso: ${filePath} não existe; permissão de execução não adicionada`);
    }
  } catch (error) {
    console.error(`Erro ao adicionar permissão de execução a ${file}:`, error);
  }
});

// Write node_path.txt immediately after build to ensure Chrome uses the correct Node.js version.
// This is critical for development mode where dist is deleted on each rebuild.
// The file points to the same Node.js that compiled the native modules (better-sqlite3 etc.)
console.log('Gravando node_path.txt...');
const nodePathFile = path.join(distDir, 'node_path.txt');
fs.writeFileSync(nodePathFile, process.execPath, 'utf8');
console.log(`Caminho do Node.js gravado: ${process.execPath}`);

console.log('✅ Build concluído');
