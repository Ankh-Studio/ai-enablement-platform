#!/usr/bin/env node

/**
 * AI Enablement Platform CLI
 *
 * Command-line interface for analyzing repository AI enablement readiness
 * and generating consultant-quality recommendations.
 */

import chalk from 'chalk';
import { Command } from 'commander';
import ora from 'ora';
import {
  type AssessmentConfig,
  AssessmentEngine,
} from '../core/assessment-engine';
import type {
  AssessmentResult,
  PersonaInsight,
  PersonaResponse,
  Recommendation,
} from '../types/persona';

const program = new Command();

program
  .name('ai-enablement')
  .description(
    'AI Enablement Platform - Analyze repository readiness for AI adoption',
  )
  .version('1.0.0');

program
  .command('analyze')
  .description('Analyze repository for AI enablement readiness')
  .argument('<repo-path>', 'Path to the repository to analyze')
  .option('-o, --output <path>', 'Output directory for results')
  .option(
    '-f, --format <format>',
    'Output format (json, adr, markdown)',
    'json',
  )
  .option('--no-recommendations', 'Skip recommendations generation')
  .option('--no-adr', 'Skip ADR generation')
  .option(
    '--persona <type>',
    'Analysis persona (consultant, evangelist, team-lead)',
    'consultant',
  )
  .option(
    '--llm-coalescing',
    'Enable LLM coalescing with adversarial validation',
  )
  .option(
    '--adversarial-validation',
    'Enable adversarial validation (default: enabled with LLM)',
  )
  .option(
    '--challenger',
    'Enable challenger pass for recommendation validation',
  )
  .option(
    '--confidence-threshold <number>',
    'Minimum confidence threshold for recommendations',
    '50',
  )
  .option(
    '--human-review-threshold <number>',
    'Confidence threshold requiring human review',
    '70',
  )
  .action(async (repoPath: string, options) => {
    try {
      const spinner = ora('Initializing AI Enablement Assessment...').start();

      const config: AssessmentConfig = {
        repoPath,
        outputPath: options.output,
        includeRecommendations: options.recommendations !== false,
        generateADR: options.adr !== false,
        outputFormat: options.format,
        persona: options.persona,
        enableLLMCoalescing: options.llmCoalescing || false,
        enableAdversarialValidation:
          options.adversarialValidation || options.llmCoalescing,
        recommendationConfig: {
          enableChallenger: options.challenger || true,
          confidenceThreshold: parseInt(options.confidenceThreshold) || 50,
          humanReviewThreshold: parseInt(options.humanReviewThreshold) || 70,
          enableFeedback: true,
        },
      };

      const engine = new AssessmentEngine(config);

      spinner.text = 'Analyzing repository...';
      const result = await engine.execute();

      spinner.succeed('Analysis complete!');

      // Display results
      displayResults(result, options.persona);

      // Save results if output path specified
      if (options.output) {
        await engine.saveResults(result);
      }
    } catch (error) {
      console.error(chalk.red('❌ Analysis failed:'), error);
      process.exit(1);
    }
  });

program
  .command('score')
  .description('Get readiness scores for a repository')
  .argument('<repo-path>', 'Path to the repository to score')
  .option('--json', 'Output scores as JSON')
  .action(async (repoPath: string, options) => {
    try {
      const engine = new AssessmentEngine({
        repoPath,
        includeRecommendations: false,
        generateADR: false,
      });

      const spinner = ora('Calculating readiness scores...').start();
      const result = await engine.execute();
      spinner.succeed('Scoring complete!');

      if (options.json) {
        console.log(JSON.stringify(result.scores, null, 2));
      } else {
        displayScores(result.scores);
      }
    } catch (error) {
      console.error(chalk.red('❌ Scoring failed:'), error);
      process.exit(1);
    }
  });

program
  .command('recommend')
  .description('Generate recommendations for a repository')
  .argument('<repo-path>', 'Path to the repository to analyze')
  .option('--priority <level>', 'Filter by priority (high, medium, low)')
  .option(
    '--category <type>',
    'Filter by category (foundation, security, workflow, ai, governance)',
  )
  .action(async (repoPath: string, options) => {
    try {
      const engine = new AssessmentEngine({
        repoPath,
        includeRecommendations: true,
        generateADR: false,
      });

      const spinner = ora('Generating recommendations...').start();
      const result = await engine.execute();
      spinner.succeed('Recommendations generated!');

      let recommendations = result.recommendations;

      // Apply filters
      if (options.priority) {
        recommendations = recommendations.filter(
          (r) => r.priority === options.priority,
        );
      }
      if (options.category) {
        recommendations = recommendations.filter(
          (r) => r.category === options.category,
        );
      }

      displayRecommendations(recommendations);
    } catch (error) {
      console.error(chalk.red('❌ Recommendation generation failed:'), error);
      process.exit(1);
    }
  });

program
  .command('adr')
  .description('Generate Architecture Decision Record for AI enablement')
  .argument('<repo-path>', 'Path to the repository to analyze')
  .option('-o, --output <path>', 'Output file for ADR')
  .option(
    '--persona <type>',
    'Analysis persona (consultant, evangelist, team-lead)',
    'consultant',
  )
  .action(async (repoPath: string, options) => {
    try {
      const engine = new AssessmentEngine({
        repoPath,
        includeRecommendations: true,
        generateADR: true,
        outputFormat: 'adr',
      });

      const spinner = ora('Generating Architecture Decision Record...').start();
      const result = await engine.execute();
      spinner.succeed('ADR generated!');

      if (options.output) {
        const fs = await import('node:fs/promises');
        await fs.writeFile(options.output, result.adr || '', 'utf-8');
        console.log(chalk.green(`📄 ADR saved to: ${options.output}`));
      } else {
        console.log(result.adr);
      }
    } catch (error) {
      console.error(chalk.red('❌ ADR generation failed:'), error);
      process.exit(1);
    }
  });

program
  .command('path')
  .description('Generate strategic AI enablement roadmap with phased approach')
  .argument('<repo-path>', 'Path to the repository to analyze')
  .option('-o, --output <path>', 'Output directory for roadmap files')
  .option(
    '--format <format>',
    'Output format (markdown, json, both)',
    'markdown',
  )
  .option(
    '--persona <type>',
    'Analysis persona (consultant, evangelist, team-lead)',
    'consultant',
  )
  .option(
    '--timeframe <months>',
    'Target timeframe for full enablement in months',
    '12',
  )
  .option(
    '--pace <speed>',
    'Implementation pace (aggressive, moderate, conservative)',
    'moderate',
  )
  .option('--include-metrics', 'Include success metrics and KPIs')
  .action(async (repoPath: string, options) => {
    try {
      const engine = new AssessmentEngine({
        repoPath,
        includeRecommendations: true,
        generateADR: false,
        outputFormat: 'json',
        persona: options.persona,
      });

      const spinner = ora(
        'Analyzing repository and generating roadmap...',
      ).start();
      const result = await engine.execute();

      spinner.text = 'Creating strategic roadmap...';
      const roadmap = await generateRoadmap(result, options);

      spinner.succeed('Roadmap generated!');

      // Display roadmap summary
      displayRoadmapSummary(roadmap);

      // Save roadmap if output path specified
      if (options.output) {
        await saveRoadmap(roadmap, options.output, options.format);
      }
    } catch (error) {
      console.error(chalk.red('❌ Roadmap generation failed:'), error);
      process.exit(1);
    }
  });

function displayResults(result: AssessmentResult, persona: string) {
  console.log(chalk.bold.blue('\n🎯 AI Enablement Assessment Results'));
  console.log(chalk.gray(`Repository: ${result.metadata.repository}`));
  console.log(chalk.gray(`Assessed: ${result.metadata.timestamp}`));
  console.log(chalk.gray(`Duration: ${result.metadata.duration}ms`));
  console.log(chalk.gray(`Version: ${result.metadata.version}`));
  console.log(chalk.gray(`Persona: ${persona}\n`));

  displayScores(result.scores);
  displayRecommendations(result.recommendations);

  // Display recommendation engine results (now standard)
  displayRecommendationEngine(result.recommendationEngine);

  // Display persona insights if available
  if (result.personaInsights) {
    displayPersonaInsights(result.personaInsights);
  }

  if (result.adr) {
    console.log(chalk.bold.blue('\n📝 Architecture Decision Record'));
    console.log(
      chalk.gray('ADR generated successfully - use --output to save to file\n'),
    );
  }
}

function displayScores(scores: AssessmentResult['scores']) {
  console.log(chalk.bold.blue('📊 Readiness Scores'));

  const scoreTable = [
    [
      'Repository Readiness',
      scores.repoReadiness,
      getScoreStatus(scores.repoReadiness),
    ],
    [
      'Team Readiness',
      scores.teamReadiness,
      getScoreStatus(scores.teamReadiness),
    ],
    [
      'Organization Readiness',
      scores.orgReadiness,
      getScoreStatus(scores.orgReadiness),
    ],
    [
      'Overall Maturity',
      scores.overallMaturity,
      getMaturityStatus(scores.overallMaturity),
    ],
  ];

  scoreTable.forEach(([label, score, status]) => {
    const scoreNum = score as number;
    const scoreColor =
      scoreNum >= 70 ? chalk.green : scoreNum >= 40 ? chalk.yellow : chalk.red;
    console.log(
      `${chalk.bold(label)}: ${scoreColor(`${scoreNum}/100`)} ${status}`,
    );
  });

  console.log(chalk.gray(`Confidence: ${scores.confidence}\n`));
}

function displayRecommendationEngine(engineResult: any) {
  console.log(chalk.bold.blue('\n🚀 Recommendation Engine Results'));
  console.log(
    chalk.gray(`Pipeline Duration: ${engineResult.metadata.totalDuration}ms`),
  );
  console.log(
    chalk.gray(`Evidence Items: ${engineResult.metadata.evidenceCount}`),
  );
  console.log(chalk.gray(`Findings: ${engineResult.findings.length}`));
  console.log(chalk.gray(`Hypotheses: ${engineResult.hypotheses.length}`));
  console.log(
    chalk.gray(
      `Final Recommendations: ${engineResult.recommendations.length}\n`,
    ),
  );

  if (engineResult.recommendations.length === 0) {
    console.log(
      chalk.green('✅ No recommendations - repository is well prepared!'),
    );
    return;
  }

  // Group recommendations by priority
  const groupedRecs = engineResult.recommendations.reduce(
    (groups: Record<string, any[]>, rec: any) => {
      if (!groups[rec.priority]) groups[rec.priority] = [];
      groups[rec.priority].push(rec);
      return groups;
    },
    {},
  );

  ['critical', 'high', 'medium', 'low'].forEach((priority) => {
    const recs = groupedRecs[priority];
    if (recs && recs.length > 0) {
      const priorityColor =
        priority === 'critical'
          ? chalk.red
          : priority === 'high'
            ? chalk.red
            : priority === 'medium'
              ? chalk.yellow
              : chalk.gray;
      console.log(
        chalk.bold(`\n${priorityColor(priority.toUpperCase())} PRIORITY:`),
      );

      recs.forEach((rec: any) => {
        console.log(`  ${chalk.bold(rec.title)} (${rec.category})`);
        console.log(`  ${chalk.gray(rec.summary)}`);
        console.log(
          `  ${chalk.blue(`Confidence: ${rec.confidence.overall}% | Evidence: ${rec.evidenceAnchors.length} anchors`)}`,
        );

        if (rec.humanReviewNeeded) {
          console.log(`  ${chalk.yellow('⚠️  Requires human review')}`);
        }

        console.log(`  ${chalk.cyan(`Next: ${rec.suggestedNextStep}`)}`);

        if (rec.caveats.length > 0) {
          console.log(
            `  ${chalk.hex('#FFA500')(`Caveats: ${rec.caveats.slice(0, 2).join('; ')}`)}`,
          );
        }
        console.log('');
      });
    }
  });
}

function displayRecommendations(recommendations: Recommendation[]) {
  if (recommendations.length === 0) {
    console.log(
      chalk.green(
        '✅ No recommendations needed - repository is well prepared!',
      ),
    );
    return;
  }

  console.log(chalk.bold.blue('🎯 Recommendations'));

  const groupedRecs = recommendations.reduce(
    (groups, rec) => {
      if (!groups[rec.priority]) groups[rec.priority] = [];
      (groups[rec.priority] as Recommendation[]).push(rec);
      return groups;
    },
    {} as Record<string, Recommendation[]>,
  );

  ['high', 'medium', 'low'].forEach((priority) => {
    const recs = groupedRecs[priority];
    if (recs && recs.length > 0) {
      const priorityColor =
        priority === 'high'
          ? chalk.red
          : priority === 'medium'
            ? chalk.yellow
            : chalk.gray;
      console.log(
        chalk.bold(`\n${priorityColor(priority.toUpperCase())} PRIORITY:`),
      );

      recs.forEach((rec: Recommendation) => {
        console.log(`  ${chalk.bold(rec.title)} (${rec.category})`);
        console.log(`  ${chalk.gray(rec.description)}`);
        console.log(
          `  ${chalk.blue(`Effort: ${rec.effort} | Timeframe: ${rec.timeframe}`)}`,
        );
        if (rec.dependencies.length > 0) {
          console.log(
            `  ${chalk.yellow(`Dependencies: ${rec.dependencies.join(', ')}`)}`,
          );
        }
        console.log('');
      });
    }
  });
}

function displayPersonaInsights(personaInsights: PersonaResponse) {
  console.log(chalk.bold.magenta('\n🤖 Persona Insights'));
  console.log(chalk.gray(`Perspective: ${personaInsights.perspective}`));
  console.log(chalk.gray(`Timeframe: ${personaInsights.timeframe}`));
  console.log(chalk.gray(`Confidence: ${personaInsights.confidence}\n`));

  if (personaInsights.summary) {
    console.log(chalk.bold.magenta('📝 Summary'));
    console.log(chalk.white(personaInsights.summary));
    console.log('');
  }

  if (personaInsights.insights && personaInsights.insights.length > 0) {
    console.log(chalk.bold.magenta('💡 Key Insights'));

    const groupedInsights = personaInsights.insights.reduce(
      (groups: Record<string, PersonaInsight[]>, insight: PersonaInsight) => {
        if (!groups[insight.type]) groups[insight.type] = [];
        (groups[insight.type] as PersonaInsight[]).push(insight);
        return groups;
      },
      {},
    );

    Object.entries(groupedInsights).forEach(([type, insights]) => {
      const typedInsights = insights as PersonaInsight[];
      const typeColor =
        type === 'warning'
          ? chalk.red
          : type === 'opportunity'
            ? chalk.green
            : type === 'analysis'
              ? chalk.blue
              : chalk.gray;

      console.log(chalk.bold(`\n${typeColor(type.toUpperCase())}:`));

      typedInsights.forEach((insight: PersonaInsight) => {
        const priorityIcon =
          insight.priority === 'critical'
            ? '🚨'
            : insight.priority === 'high'
              ? '⚠️'
              : insight.priority === 'medium'
                ? '🔸'
                : '🔹';

        console.log(`  ${priorityIcon} ${chalk.bold(insight.title)}`);
        console.log(`  ${chalk.gray(insight.description)}`);
        console.log(
          `  ${chalk.blue(`Confidence: ${insight.confidence}% | Category: ${insight.category}`)}`,
        );
        if (insight.evidence && insight.evidence.length > 0) {
          console.log(
            `  ${chalk.yellow(`Evidence: ${insight.evidence.join(', ')}`)}`,
          );
        }
        console.log('');
      });
    });
  }

  if (personaInsights.nextSteps && personaInsights.nextSteps.length > 0) {
    console.log(chalk.bold.magenta('🎯 Next Steps'));
    personaInsights.nextSteps.forEach((step: string, index: number) => {
      console.log(`  ${index + 1}. ${chalk.white(step)}`);
    });
    console.log('');
  }
}

function getScoreStatus(score: number): string {
  if (score >= 80) return chalk.green('✅ Excellent');
  if (score >= 60) return chalk.yellow('⚠️ Good');
  if (score >= 40) return chalk.hex('#FFA500')('🔶 Fair');
  return chalk.red('❌ Poor');
}

function getMaturityStatus(level: number): string {
  if (level >= 6) return chalk.green('✅ Advanced');
  if (level >= 4) return chalk.yellow('⚠️ Developing');
  if (level >= 2) return chalk.hex('#FFA500')('🔶 Basic');
  return chalk.red('❌ Initial');
}

interface RoadmapPhase {
  id: string;
  name: string;
  description: string;
  duration: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  objectives: string[];
  actions: Array<{
    title: string;
    description: string;
    effort: string;
    timeframe: string;
    dependencies: string[];
    expectedOutcomes: string[];
    successMetrics?: string[];
  }>;
  risks: Array<{
    description: string;
    mitigation: string;
    probability: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
  }>;
}

interface Roadmap {
  metadata: {
    repository: string;
    generated: string;
    timeframe: number;
    pace: string;
    persona: string;
  };
  summary: {
    currentMaturity: number;
    targetMaturity: number;
    totalPhases: number;
    estimatedDuration: string;
    criticalPath: string[];
  };
  phases: RoadmapPhase[];
  successMetrics: {
    kpis: Array<{
      name: string;
      description: string;
      target: string;
      measurement: string;
    }>;
    milestones: Array<{
      name: string;
      date: string;
      criteria: string[];
    }>;
  };
}

async function generateRoadmap(
  result: AssessmentResult,
  options: any,
): Promise<Roadmap> {
  const timeframe = parseInt(options.timeframe) || 12;
  const pace = options.pace || 'moderate';

  // Calculate phase distribution based on pace
  const paceMultipliers = {
    aggressive: 0.75,
    moderate: 1.0,
    conservative: 1.5,
  };

  const adjustedTimeframe =
    timeframe * paceMultipliers[pace as keyof typeof paceMultipliers];

  // Group recommendations by category and priority
  const groupedRecs = result.recommendations.reduce(
    (groups, rec) => {
      const key = `${rec.category}-${rec.priority}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(rec);
      return groups;
    },
    {} as Record<string, Recommendation[]>,
  );

  // Create phases based on current maturity and recommendations
  const phases = createPhases(
    result.scores.overallMaturity,
    groupedRecs,
    adjustedTimeframe,
  );

  const roadmap: Roadmap = {
    metadata: {
      repository: result.metadata.repository,
      generated: new Date().toISOString(),
      timeframe,
      pace,
      persona: options.persona || 'consultant',
    },
    summary: {
      currentMaturity: result.scores.overallMaturity,
      targetMaturity: Math.min(8, result.scores.overallMaturity + 3),
      totalPhases: phases.length,
      estimatedDuration: `${Math.ceil(adjustedTimeframe)} months`,
      criticalPath: getCriticalPath(phases),
    },
    phases,
    successMetrics: options.includeMetrics
      ? generateSuccessMetrics(phases)
      : { kpis: [], milestones: [] },
  };

  return roadmap;
}

function createPhases(
  currentMaturity: number,
  groupedRecs: Record<string, Recommendation[]>,
  timeframe: number,
): RoadmapPhase[] {
  const phases: RoadmapPhase[] = [];

  // Phase 1: Foundation (always needed if maturity < 6)
  if (currentMaturity < 6) {
    const foundationRecs = Object.entries(groupedRecs)
      .filter(([key]) => key.includes('foundation') || key.includes('high'))
      .flatMap(([, recs]) => recs);

    phases.push({
      id: 'foundation',
      name: 'Foundation & Infrastructure',
      description:
        'Establish the technical and organizational foundation for AI enablement',
      duration: `${Math.ceil(timeframe * 0.25)} months`,
      priority: 'critical',
      objectives: [
        'Establish robust development infrastructure',
        'Implement security and governance frameworks',
        'Build foundational AI tooling and workflows',
      ],
      actions: foundationRecs.map((rec) => ({
        title: rec.title,
        description: rec.description,
        effort: rec.effort,
        timeframe: rec.timeframe,
        dependencies: rec.dependencies,
        expectedOutcomes: [
          `Improved ${rec.category} maturity`,
          'Reduced technical debt',
          'Enhanced team productivity',
        ],
      })),
      risks: [
        {
          description: 'Resource constraints delaying foundation work',
          mitigation: 'Phase critical items, secure executive sponsorship',
          probability: 'medium',
          impact: 'high',
        },
      ],
    });
  }

  // Phase 2: AI Integration
  if (currentMaturity < 7) {
    const aiRecs = Object.entries(groupedRecs)
      .filter(([key]) => key.includes('ai') || key.includes('workflow'))
      .flatMap(([, recs]) => recs);

    phases.push({
      id: 'integration',
      name: 'AI Integration & Adoption',
      description:
        'Integrate AI tools into development workflows and build team capabilities',
      duration: `${Math.ceil(timeframe * 0.35)} months`,
      priority: 'high',
      objectives: [
        'Deploy AI-powered development tools',
        'Train teams on AI-assisted workflows',
        'Establish AI governance and best practices',
      ],
      actions: aiRecs.map((rec) => ({
        title: rec.title,
        description: rec.description,
        effort: rec.effort,
        timeframe: rec.timeframe,
        dependencies: rec.dependencies,
        expectedOutcomes: [
          'Increased developer productivity',
          'Improved code quality',
          'Enhanced innovation capacity',
        ],
      })),
      risks: [
        {
          description: 'Team resistance to AI adoption',
          mitigation: 'Comprehensive training, demonstrate quick wins',
          probability: 'medium',
          impact: 'medium',
        },
      ],
    });
  }

  // Phase 3: Optimization & Scale
  phases.push({
    id: 'optimization',
    name: 'Optimization & Scale',
    description:
      'Optimize AI workflows and scale successful practices across the organization',
    duration: `${Math.ceil(timeframe * 0.4)} months`,
    priority: 'medium',
    objectives: [
      'Optimize AI tooling and workflows',
      'Scale successful practices organization-wide',
      'Establish continuous improvement processes',
    ],
    actions: [
      {
        title: 'Implement Advanced AI Analytics',
        description:
          'Deploy sophisticated AI-powered analytics for development insights',
        effort: 'High',
        timeframe: '2-3 months',
        dependencies: [
          'Foundation & Infrastructure',
          'AI Integration & Adoption',
        ],
        expectedOutcomes: [
          'Data-driven decision making',
          'Predictive insights for development',
          'Continuous performance monitoring',
        ],
        successMetrics: [
          '50% reduction in bug detection time',
          '30% improvement in deployment frequency',
          '25% reduction in technical debt accumulation',
        ],
      },
      {
        title: 'Establish AI Center of Excellence',
        description:
          'Create a centralized team to drive AI innovation and best practices',
        effort: 'Medium',
        timeframe: '1-2 months',
        dependencies: ['AI Integration & Adoption'],
        expectedOutcomes: [
          'Centralized AI expertise',
          'Standardized best practices',
          'Innovation incubation',
        ],
      },
    ],
    risks: [
      {
        description: 'Scaling challenges as organization grows',
        mitigation: 'Build scalable processes, document best practices',
        probability: 'low',
        impact: 'medium',
      },
    ],
  });

  return phases;
}

function getCriticalPath(phases: RoadmapPhase[]): string[] {
  return phases
    .filter(
      (phase) => phase.priority === 'critical' || phase.priority === 'high',
    )
    .map((phase) => phase.name);
}

function generateSuccessMetrics(phases: RoadmapPhase[]) {
  return {
    kpis: [
      {
        name: 'Developer Productivity',
        description: 'Measure of developer output and efficiency',
        target: '+30% in 6 months',
        measurement: 'Lines of code per developer, deployment frequency',
      },
      {
        name: 'Code Quality',
        description: 'Overall codebase health and maintainability',
        target: 'Reduce bugs by 40%',
        measurement: 'Bug density, test coverage, code review metrics',
      },
      {
        name: 'AI Adoption Rate',
        description: 'Percentage of team actively using AI tools',
        target: '80% adoption in 3 months',
        measurement: 'Tool usage analytics, survey responses',
      },
    ],
    milestones: [
      {
        name: 'Foundation Complete',
        date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        criteria: [
          'All infrastructure recommendations implemented',
          'Security frameworks in place',
          'Team training completed',
        ],
      },
      {
        name: 'AI Integration Milestone',
        date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        criteria: [
          'AI tools deployed to all teams',
          '70% adoption rate achieved',
          'Productivity gains measurable',
        ],
      },
    ],
  };
}

function displayRoadmapSummary(roadmap: Roadmap) {
  console.log(chalk.bold.blue('\n🛣️  AI Enablement Roadmap'));
  console.log(chalk.gray(`Repository: ${roadmap.metadata.repository}`));
  console.log(
    chalk.gray(
      `Generated: ${new Date(roadmap.metadata.generated).toLocaleDateString()}`,
    ),
  );
  console.log(chalk.gray(`Timeframe: ${roadmap.summary.estimatedDuration}`));
  console.log(chalk.gray(`Pace: ${roadmap.metadata.pace}\n`));

  console.log(chalk.bold('📊 Maturity Progression'));
  console.log(
    `Current: ${chalk.yellow(roadmap.summary.currentMaturity)}/8 → Target: ${chalk.green(roadmap.summary.targetMaturity)}/8`,
  );
  console.log(`Total Phases: ${roadmap.summary.totalPhases}`);
  console.log(`Critical Path: ${roadmap.summary.criticalPath.join(' → ')}\n`);

  console.log(chalk.bold('🎯 Phases Overview'));
  roadmap.phases.forEach((phase, index) => {
    const priorityColor =
      phase.priority === 'critical'
        ? chalk.red
        : phase.priority === 'high'
          ? chalk.yellow
          : phase.priority === 'medium'
            ? chalk.blue
            : chalk.gray;

    console.log(
      `\n${index + 1}. ${chalk.bold(phase.name)} ${priorityColor(`(${phase.priority.toUpperCase()})`)}`,
    );
    console.log(`   ${chalk.gray(phase.description)}`);
    console.log(
      `   ${chalk.blue(`Duration: ${phase.duration} | Actions: ${phase.actions.length}`)}`,
    );

    phase.objectives.slice(0, 2).forEach((obj) => {
      console.log(`   • ${chalk.white(obj)}`);
    });
  });

  if (roadmap.successMetrics.kpis.length > 0) {
    console.log(chalk.bold('\n📈 Key Success Metrics'));
    roadmap.successMetrics.kpis.slice(0, 3).forEach((kpi) => {
      console.log(`• ${chalk.bold(kpi.name)}: ${kpi.target}`);
    });
  }
}

async function saveRoadmap(
  roadmap: Roadmap,
  outputPath: string,
  format: string,
) {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');

  await fs.mkdir(outputPath, { recursive: true });

  if (format === 'markdown' || format === 'both') {
    const markdown = generateMarkdownRoadmap(roadmap);
    await fs.writeFile(path.join(outputPath, 'roadmap.md'), markdown, 'utf-8');
    console.log(
      chalk.green(
        `📄 Roadmap saved to: ${path.join(outputPath, 'roadmap.md')}`,
      ),
    );
  }

  if (format === 'json' || format === 'both') {
    await fs.writeFile(
      path.join(outputPath, 'roadmap.json'),
      JSON.stringify(roadmap, null, 2),
      'utf-8',
    );
    console.log(
      chalk.green(
        `📄 Roadmap saved to: ${path.join(outputPath, 'roadmap.json')}`,
      ),
    );
  }
}

function generateMarkdownRoadmap(roadmap: Roadmap): string {
  let markdown = `# AI Enablement Roadmap

**Repository:** ${roadmap.metadata.repository}  
**Generated:** ${new Date(roadmap.metadata.generated).toLocaleDateString()}  
**Timeframe:** ${roadmap.summary.estimatedDuration} (${roadmap.metadata.pace} pace)  
**Persona:** ${roadmap.metadata.persona}

## Executive Summary

- **Current Maturity:** ${roadmap.summary.currentMaturity}/8
- **Target Maturity:** ${roadmap.summary.targetMaturity}/8
- **Total Phases:** ${roadmap.summary.totalPhases}
- **Critical Path:** ${roadmap.summary.criticalPath.join(' → ')}

`;

  roadmap.phases.forEach((phase, index) => {
    markdown += `## Phase ${index + 1}: ${phase.name}

**Priority:** ${phase.priority.toUpperCase()}  
**Duration:** ${phase.duration}

${phase.description}

### Objectives
`;
    phase.objectives.forEach((obj) => {
      markdown += `- ${obj}\n`;
    });

    markdown += `\n### Actions\n`;
    phase.actions.forEach((action) => {
      markdown += `#### ${action.title}

**Effort:** ${action.effort} | **Timeframe:** ${action.timeframe}

${action.description}

**Expected Outcomes:**
`;
      action.expectedOutcomes.forEach((outcome) => {
        markdown += `- ${outcome}\n`;
      });

      if (action.dependencies.length > 0) {
        markdown += `\n**Dependencies:** ${action.dependencies.join(', ')}\n`;
      }

      if (action.successMetrics && action.successMetrics.length > 0) {
        markdown += `\n**Success Metrics:**\n`;
        action.successMetrics.forEach((metric) => {
          markdown += `- ${metric}\n`;
        });
      }
      markdown += '\n';
    });

    if (phase.risks.length > 0) {
      markdown += `### Risks & Mitigations\n`;
      phase.risks.forEach((risk) => {
        markdown += `- **${risk.description}** (${risk.probability} probability, ${risk.impact} impact)\n`;
        markdown += `  - *Mitigation:* ${risk.mitigation}\n`;
      });
      markdown += '\n';
    }
  });

  if (roadmap.successMetrics.kpis.length > 0) {
    markdown += `## Success Metrics\n\n### Key Performance Indicators\n`;
    roadmap.successMetrics.kpis.forEach((kpi) => {
      markdown += `#### ${kpi.name}

**Target:** ${kpi.target}

${kpi.description}

**Measurement:** ${kpi.measurement}

`;
    });

    markdown += `### Milestones\n`;
    roadmap.successMetrics.milestones.forEach((milestone) => {
      markdown += `#### ${milestone.name} (${milestone.date})

`;
      milestone.criteria.forEach((criteria) => {
        markdown += `- ${criteria}\n`;
      });
      markdown += '\n';
    });
  }

  return markdown;
}

// Error handling
process.on('uncaughtException', (error) => {
  console.error(chalk.red('❌ Uncaught exception:'), error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(
    chalk.red('❌ Unhandled rejection at:'),
    promise,
    'reason:',
    reason,
  );
  process.exit(1);
});

// Parse command line arguments
program.parse();
