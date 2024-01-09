pipeline {
    agent any

    environment {
        // 定义环境变量，例如 Docker 镜像名称
        IMAGE_NAME = 'jasonbourne77666_server'
        BUILD_NUMBER = '0.0.1'
    }

    stages {
        stage('Build') {
            steps {
            nodejs('node18.19') {
                    sh "node --version"
                    // 使用npm镜像源
                    sh "npm config set registry https://registry.npmmirror.com/"
                    // 安装依赖
                    sh "npm install"
                    // 运行构建
                    sh "npm run build"
                    // 压缩dist-new文件夹
                    sh "tar -zcvf dist-new.tar.gz dist-new"
                }
            }
        }

        // stage('Test') {
        //     steps {
        //         script {
        //             // 运行测试（确保 Dockerfile 中有相应的 CMD 或 ENTRYPOINT）
        //             sh "docker run --rm ${IMAGE_NAME}:${BUILD_NUMBER} npm test"
        //         }
        //     }
        // }

        stage('Deploy') {
            steps {
                script {
                    // 流水线语法 Exec command
                    // cd /project/server && pm2 stop server || true && pm2 delete server && rm -rf dist-new && tar -xzvf dist-new.tar.gz && cd dist-new && npm install --omit-dev && nohup npm run start:prod > /dev/null 2>&1 &
                    sshPublisher(publishers: [sshPublisherDesc(configName: 'aliyun_server', transfers: [sshTransfer(cleanRemote: false, excludes: '', execCommand: '', execTimeout: 120000, flatten: false, makeEmptyDirs: false, noDefaultExcludes: false, patternSeparator: '[, ]+', remoteDirectory: '/server', remoteDirectorySDF: false, removePrefix: '', sourceFiles: 'dist-new.tar.gz')], usePromotionTimestamp: false, useWorkspaceInPromotion: false, verbose: false)])
                    echo 'Credentials SUCCESS'
                }
            }
        }
    }

    // post {
    //     always {
    //         // sh "node --version"
    //         // 清理工作，例如删除构建时创建的 Docker 镜像和容器
    //         // sh "docker container prune -f"
    //         // sh "docker image prune -f"
    //     }
    //     // success {
    //         // 成功构建后的操作，例如发送通知
    //     // }
    //     // failure {
    //         // 构建失败的操作，例如发送通知
    //     // }
    // }
}
