# 《Reinforcement Fine-tuning LLMs with GRPO》Predibase

Link：[吴恩达《使用 GRPO 对大型语言模型进行强化微调Reinforcement Fine-Tuning LLMs with GRPO》](https://www.bilibili.com/video/BV1RMjJziEH2?t=10.9)

# 01.Intro

RFT：Reinforcement Fine-Tuning 强化微调

1. 一种使用Reinforcement Learning的训练技术，用于提高LLMs在任务上的表现，这些任务需要多步推理，比如完成数学或代码生成之类的任务。
2. 通过利用LLMs解决问题的推理能力，进行逐步思考，RFT引导模型自动发现复杂任务的解决方案，而不是像SFT依赖pre-existing examples
3. 这种方法让你能够使模型适应复杂任务，在使用更少的训练数据的情况下，仅需几十个examples，而不是进行SFT通常需要的数量



GRPO：

1. LLM对单个prompt生成multiple responses
2. 然后使用reward function对这些回复进行评分
3. 该评分基于Verifiable metrics（可验证的指标），如正确的格式，或功能正常的代码
4. 这种reward function的使用是关键区别，区分了GRPO和其他RL算法
   1. PPO或者DPO依赖人类反馈或复杂的多模型系统来分配rewards



能够很好reason的LLMs是许多agentic systems的关键组件，而RFT将使较小的模型在agenttic workflow中表现良好

