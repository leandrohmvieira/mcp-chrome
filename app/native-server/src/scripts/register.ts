#!/usr/bin/env node
import path from 'path';
import { COMMAND_NAME } from './constant';
import { colorText, registerWithElevatedPermissions, writeNodePathFile } from './utils';

/**
 * 主函数
 */
async function main(): Promise<void> {
  console.log(colorText(`Registrando o host de Native Messaging ${COMMAND_NAME}...`, 'blue'));

  try {
    // Write Node.js path before registration
    writeNodePathFile(path.join(__dirname, '..'));

    await registerWithElevatedPermissions();
    console.log(
      colorText(
        'Registro concluído! A extensão do Chrome já pode se comunicar com o serviço local via Native Messaging.',
        'green',
      ),
    );
  } catch (error: any) {
    console.error(colorText(`Falha no registro: ${error.message}`, 'red'));
    process.exit(1);
  }
}

// 执行主函数
main();
