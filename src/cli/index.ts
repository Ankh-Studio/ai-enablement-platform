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

function displayResults(result: any, persona: string) {
  console.log(chalk.bold.blue('\n🎯 AI Enablement Assessment Results'));
  console.log(chalk.gray(`Repository: ${result.metadata.repository}`));
  console.log(chalk.gray(`Assessed: ${result.metadata.timestamp}`));
  console.log(chalk.gray(`Duration: ${result.metadata.duration}ms`));
  console.log(chalk.gray(`Persona: ${persona}\n`));

  displayScores(result.scores);
  displayRecommendations(result.recommendations);

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

function displayScores(scores: any) {
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
    const scoreColor =
      score >= 70 ? chalk.green : score >= 40 ? chalk.yellow : chalk.red;
    console.log(
      `${chalk.bold(label)}: ${scoreColor(`${score}/100`)} ${status}`,
    );
  });

  console.log(chalk.gray(`Confidence: ${scores.confidence}\n`));
}

function displayRecommendations(recommendations: any[]) {
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
      groups[rec.priority].push(rec);
      return groups;
    },
    {} as Record<string, any[]>,
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

      recs.forEach((rec: any) => {
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

function displayPersonaInsights(personaInsights: any) {
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
      (groups: any, insight: any) => {
        if (!groups[insight.type]) groups[insight.type] = [];
        groups[insight.type].push(insight);
        return groups;
      },
      {},
    );

    Object.entries(groupedInsights).forEach(([type, insights]) => {
      const typedInsights = insights as any[];
      const typeColor =
        type === 'warning'
          ? chalk.red
          : type === 'opportunity'
            ? chalk.green
            : type === 'analysis'
              ? chalk.blue
              : chalk.gray;

      console.log(chalk.bold(`\n${typeColor(type.toUpperCase())}:`));

      typedInsights.forEach((insight: any) => {
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
