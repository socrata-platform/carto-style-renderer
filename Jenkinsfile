@Library('socrata-pipeline-library@9.6.1') _

commonPipeline(
    docker: [
        secrets: ['npmrc': 'src="$HOME/.npmrc"'],
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
            paths: [
                dockerBuildContext: '.',
            ],
            type: 'service',
        ]
    ],
    teamsChannelWebhookId: 'WORKFLOW_EGRESS_AUTOMATION',
)
