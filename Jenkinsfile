pipeline {
    agent any

    environment {
        // 定义环境变量，例如 Docker 镜像名称
        IMAGE_NAME = 'jasonbourne77666_server'
        BUILD_NUMBER = '0.0.1'
        USERNAME = 'jasonbourne77666@gmail.com'
        PASSWORD = 'Js123456.'
    }

    stages {
        stage('Build') {
            steps {
                script {
                    // 构建 Docker 镜像
                    sh "docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} ."
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
                    // 登录到 Docker 镜像仓库（如果需要）
                    // sh "docker login -u ${USERNAME} -p ${PASSWORD}}"

                    // 推送 Docker 镜像到仓库
                    // sh "docker push ${IMAGE_NAME}:${BUILD_NUMBER}"

                    // 这里添加部署到服务器的命令或者直接在jenkins上部署
                    sh "docker run -d -p 3000:3000 --name ${IMAGE_NAME} ${IMAGE_NAME}:${BUILD_NUMBER}"

                    // 例如，使用 SSH 连接到服务器并更新 Docker 容器
                }
            }
        }
    }

    post {
        always {
            // 清理工作，例如删除构建时创建的 Docker 镜像和容器
            sh "docker container prune"
            sh "docker image prune"
        }
        // success {
            // 成功构建后的操作，例如发送通知
        // }
        // failure {
            // 构建失败的操作，例如发送通知
        // }
    }
}
