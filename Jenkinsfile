@Library('socrata-pipeline-library@sarahs/EN-71019/add-testing-and-build-args-to-common-pipeline') _

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
