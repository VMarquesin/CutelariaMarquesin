import { Client } from 'minio';

const minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT || 'minio',
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

const bucketName = 'perfil-fotos';

// Função para criar o bucket e deixá-lo público automaticamente
const inicializarBucket = async () => {
    try {
        const existe = await minioClient.bucketExists(bucketName);
        if (!existe) {
            await minioClient.makeBucket(bucketName, 'us-east-1');
            console.log(`[MinIO] Bucket '${bucketName}' criado com sucesso.`);
            
            // Política de Leitura Pública (Download Anônimo)
            const policy = {
                Version: "2012-10-17",
                Statement: [
                    {
                        Action: ["s3:GetObject"],
                        Effect: "Allow",
                        Principal: "*",
                        Resource: [`arn:aws:s3:::${bucketName}/*`]
                    }
                ]
            };
            await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
            console.log(`[MinIO] Política pública aplicada ao bucket '${bucketName}'.`);
        } else {
            console.log(`[MinIO] Bucket '${bucketName}' já está pronto para uso.`);
        }
    } catch (erro) {
        console.error("[MinIO] Erro ao inicializar bucket:", erro);
    }
};

inicializarBucket();

export default minioClient;