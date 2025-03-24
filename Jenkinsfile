@Library('socrata-pipeline-library@3.0.0') _

Map pipelineParams = [
    defaultBuildWorker: 'build-worker',
    dockerSecrets: [
        'id=npmrc,src="$HOME/.npmrc"'
    ],
    jobName: 'carto-style-renderer',
    language: 'javascript',
    paths: [
        testExecutable: 'bin/test.sh'
    ],
    projects: [
        [
            name: 'carto-style-renderer',
            deploymentEcosystem: 'marathon-mesos',
            type: 'service',
        ]
    ],
    teamsChannelWebhookId: 'WORKFLOW_IQ',
]
commonPipeline(pipelineParams)
