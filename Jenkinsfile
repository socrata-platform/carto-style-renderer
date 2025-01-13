@Library('socrata-pipeline-library@0.1.0') _

Map pipelineParams = [
  defaultBuildWorker: 'build-worker',
  deploymentEcosystem: 'marathon-mesos',
  dockerSecrets: ['id=npmrc,src="$HOME/.npmrc"'],
  language: 'javascript',
  projectName: 'carto-style-renderer',
  teamsChannelWebhookId: 'WORKFLOW_IQ',
  testFilePath: 'bin/test.sh'
]
commonServicePipeline(pipelineParams)
