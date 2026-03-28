# 《Post-training of LLMs》Banghua Zhu, Andrew Ng

Link: [吴恩达《大型语言模型的后训练|Post-training of LLMs》中英字幕](https://www.bilibili.com/video/BV1aPuLzMER1/?spm_id_from=333.337.search-card.all.click&vd_source=ffe27f664a389c93f783f37e506048ab)

# 01.Introduction

- 训练LLM分为两个阶段：

  1. pre-trainning：模型从计算和成本角度学习预测下一个单词或标记。这是主要训练阶段，可能需要在万亿或者十万亿个tokens上训练
  2. post-training：模型进一步训练以执行更具体任务，如回答问题。此阶段通常使用更小的数据集，而且数据更快，成本更低

- 本门课你将学习三种常见后训练方法：

  1. SFT（Surpervised Learning）：基于带标签的prompt-response pairs，帮助LLM学习遵循指令，或通过复制input-prompt和disered-response关系来使用工具。SFT对应如新行为特别有效，或对模型进行重大更改
  2. DPO（Direct Preference Optimization，直接偏好优化）：通过展示good and bad answers来教导模型，DPO为同一prompt给模型提供两个选项，其中一个比另一个更受偏好。DPO通过对比损失，推动模型更接近good responses，远离bad responses
  3. Online Reinforcement Learning，在线强化学习：你提供prompt，然后LLM生成responses，然后reward function对答案的质量进行评分，模型随后根据这些reward scores进行更新。
     1. 获取reward model以得到reward scores的一种方式是人类对响应质量的判断（human judements of the quality of responses）。
        1. 可以训练一个函数来分配scores，从而以一种与人类判断一致的方式对responses进行评分。
        2. 最常见的算法是近端策略优化（Proximal Policy Optimization，PPO）
     2. 提出rewards的另一种方式是可验证奖励（Verifiable Rewards），适用于具有客观正确性度量的任务，如math或coding
        1. 你可以使用math checker或者unit tests以客观方式判断生成的数学解答或者代码是否正确
        2. 这种正确性的度量随后为你提供reward function
        3. 使用这些reward functions的一个强大算法是GRPO（Group Relative Policy Optimization，分组相对策略优化）

  # 02.Introduction for post-training

-  post-training：试图从精选数据中学习回复，包括聊天数据、工具使用或智能体数据。之后通常会得到一个指令模型（Instruct Model）或对话模型（Chat Model），它能够响应指令（respond to instructions）或与用户对话

- further or continual post-learning：试图改变模型行为，或增强模型的某些能力，之后就得到了定制模型（customized Model），它在某些领域专精或具有特定行为。理想情况下，领域知识应该超过1B tokens

1. Pre-training（无监督学习unsupervised Learning）
2. Post-training Method 1：Supervised Fine-tuning （SFT）
   1. 通常需要1k到1b tokens
3. Post-training Method 2：Direct Preference Optimization（直接偏好优化DPO）
   1. 通常创建一个格式为「prompt，good responses，bad response」的数据集
   2. 尝试训练模型，使其远离bad responses
   3. 通常需要1k到1b tokens，和一个更复杂的，用于这种偏好优化的loss function
4. Post-training Method 3：Online Reinforcement Learning
   1. 通常只需要一个prompt和一个reward function
   2. 从一个prompt开始，通常让LLM自己生成一个response
   3. 并使用reward function为该response生成一个reward
   4. 使用该信号来更新模型
   5. 通常需要1k到10m prompts
   6. 目标是最大化prompt和response的reward



通常Post-training需要正确把握三个要素：

1. Data & algorithm co-design（数据和算法的良好协同设计）：每种算法都需要准备略微不同的数据结构
2. Reliable & efficient library（可靠且高效的库）能正确实现大多数算法：HuggingfaceTRL、OpenRHLF、veRL、Nemo RL
3. Appropriate evaluation suite（适当的评估套件）：我们需要跟踪模型性能并确保模型始终变现良好



# 03.Basics of SFT

1. SFT ≈ Imitate example responses模仿示例回复

2. label data：「user questions，assistant responses」

3. SFT的工作方式是最小化负对数似然（Negative Log Likelihood）：
   $$
   \mathcal{L}_{\mathrm{SFT}} = - \sum_{i=1}^{N} \log \big( p_{\theta}(\mathrm{Response}{(i)} \mid \mathrm{Prompt}{(i)}) \big)
   $$


   1. SFT minimizes negative log likelihood for the responses (maximized likelihood) with cross entropy loss：「最小化负对数似然」与「最大化似然」在优化目标上等价

   2. 其中似然（likelihood）是在给定prior tokens（包含prompt tokens）的情况下，responses中生成的tokens 概率的乘积

   3. 所以我们训练模型再给定prompt的情况下，最大化输出你提供的回复的可能性 ≈ SFT试图imitate example responses

4. 如何理解最小化负对数似然？


   1. 假设某个样本的回答概率是：
      $$
      p_{\theta}(\mathrm{Response}{(i)} \mid \mathrm{Prompt}{(i)})
      $$

   2. 我们希望这个概率越大越好，也就是：
      $$
      \max_{\theta}\; p_{\theta}\!\left(\mathrm{Response}{(i)} \mid \mathrm{Prompt}{(i)}\right)
      $$

   3. 但训练时一般写成损失最小化，于是取对数再加负号：
      $$
      \min_{\theta}\; -\log p_{\theta}\!\left(\mathrm{Response}{(i)} \mid \mathrm{Prompt}{(i)}\right)
      $$

   4. 之所以等价，是因为：log(x)在x>0上是单调递增；所以最大化P，等价于最大化log(p)；而最大化log(p)，等价于最小化-log(p)  

   5. 在基础模型（base model）上执行SFT之后，我们通常会得到一个微调模型（fine-tuned model），或者指令模型（instruct model），它能够适当地回应任何用户查询

   6. SFT的最佳用例：

   1. 快速启动新的模型行为：
      1. Pre-trained models -> Instruct models
      2. Non-reasoning models -> reasoning models
   2. 提升特定的模型能力（Improve certain model capabilities）
      1. 为较小的模型蒸馏能力，通过在由较大模型生成的高质量合成数据上训练（本质上是使用SFT将较大模型的能力蒸馏到较小模型中）

   7. 监督式微调数据整理的原则/方法（Principles of SFT data curation）

   1. DIstillation（蒸馏）：从更强大更大的指令模型生成那些回复，并让较小的模型模仿那些生成的回复
   2. Best of K（K选优），或者 rejection sampling（拒绝采样）：从一个原始模型生成多个回复，从中选择最好的，使用奖励函数或者其他一些自动方法。就可以获得最佳回复，并尝试模仿由模型自身生成的那些最佳回复。
   3. Filtering（过滤）：从一个非常大规模的SFT数据集开始，然后根据response的质量和prompt的多样性来过滤它们，从而获得一个规模更小的SFT数据集，这个数据集质量更高且足够多样化。
   4. Quality > Quantity for improving capabilities：质量比数量对提升能力更重要

   8. Full Fint-tuning vs Parameter Efficient Fune-tuning (PEFT）

   1. 全参数微调和PEFT 都可以与这里讨论的任何Post-traiining 方法结合使用

# 04.SFT in practice

框架tfl（fromtransformer）

# 05.Basics of DPO

介绍：

1. 直接偏好优化（Direct Preference Optimization，DPO）
2. DPO可以视为一种对比学习方法（Contrastive Learning），同时学习postive和negative responses。通常从一个指令型LLM（Instruct LLM）开始
3. DPO通常被视为最小化对比损失，其penalize negative response，and encourage positive response。DPO loss 实际上是一个交叉熵损失，作用于重参数化奖励模型（‘re-parameterized’ reward model）的奖励差异上

**DPO LOSS：**
$$
\mathcal{L}_{\mathrm{DPO}}
=
-\log \sigma \left(
\beta \left(
\log \frac{\pi_{\theta}(y_{\mathrm{pos}} \mid x)}{\pi_{\mathrm{ref}}(y_{\mathrm{pos}} \mid x)}
-
\log \frac{\pi_{\theta}(y_{\mathrm{neg}} \mid x)}{\pi_{\mathrm{ref}}(y_{\mathrm{neg}} \mid x)}
\right)
\right)
$$
其中：

- $\sigma$: Sigmoid function
- $\beta$: hyperparameter超参数，其越大，对数差异就可能越重要
- $\pi_{\theta}$: fine-tuned model微调模型
- $\pi_{\mathrm{ref}}$: reference model参考模型，是原始模型（original model）的一个副本，权重被固定

解读：

1. Loss 是某些对数差异的sigmoid函数的负对数：
   $$
   \sigma(x) = \frac{1}{1 + e^{-x}}
   $$

2. 对数比率项可以被视为奖励模型的重参数化：
   $$
   \log 
   \frac
   {\pi_{\theta}(y_{\mathrm{neg}} \mid x)}
   {\pi_{\mathrm{ref}}(y_{\mathrm{neg}} \mid x)}
   $$

3. 如果你将公式（7）视为奖励模型，那么整个DPO loss本质上是一个sigmoid函数，作用于正样本和负样本之间的奖励差异。本质上，DPO试图最大化正样本的奖励，并最小化负样本的奖励。

DPO的最佳使用场景：

1. Changing model behavior（改变模型行为）
   1. 改变模型身份
   2. 使其在multilingual上表现更好
   3. 提升指令遵循能力
   4. 改变模型的一些安全相关响应
2. Improving model capabilities（提升模型能力）
   1. DPO在提升模型能力方面可以比SFT更好，因为其能看到好样本和坏样本的对比性
   2. Online DPO在提升能力方面比Offline DPO更好

DPO Data Curation（数据策划）原则：

1. Correction（纠正方法）：从原始模型生成response，将其作为negative sample，然后进行一些改进使其成为positive response（例如：changing the identity of the model）
2. Online / On-policy DPO：针对同一个prompt，从当前模型生成多个responses，搜集best response as a positive sample，and worst response as a negative
   1. 可以使用一些reword function或者人类判断来区分positive和negative response

最后，要避免在DPO中overfitting，因为DPO本质上是在进行一些reward learning（奖励学习），很容易overfit到某些捷径（例如：当面样本总是包含一些特殊词，而负面样本不包含 ）

# 06.DPO in practice

框架：trl

from trl import DPOTrainer, DPOConfig

# 07.Basics of Online RL

Online Learning：模型通常通过实时生成新的responses来进行学习，它迭代地收集新的responses及其对应的rewards，并使用这些response和reward来更新其权重。锁着模型进一步学习和自我更新，探索新的responses

Offline Learning：模型通常纯粹从预先收集的prompt、response，或reward元组中学习，在学习过程中不会生成新的回应。

Online Reinforcement Learning：

1. 我们通常指的是Reinforcement Learning方法在Online Learning环境中的应用。
2. Online RL通常通过让模型自行探索更好的Responses来工作：
   1. 通常我们可以从一批Prompts开始，把它们发送给现有的语言模型，语言模型将会生成所有相应的回应基于这些提示词，然后获得prompts和responses对。
   2. 在获得prompts和responses对之后，我们将其发送给一个Reward Function。Reward Func负责为每个Prompt和Response标记一个奖励值，然后我们得到一个包含Prompts，Responses，Rewards的元组Tuple。我们将使用它来更新语言模型。
   3. 这里语言模型的更新可以使用不同的算法，比如：
      - PPO（Proximal Policy Optimization，近端策略优化）
      - GRPO（Group Relative Policy optimization，分组相对策略优化）



Reward Function in Online RL：

- Option 1：Trained Reward Model

  1. 模型生成多个responses（或从不同来源收集）

  2. 然后由人类进行判断（喜欢哪个，不喜欢哪个）

  3. 然后在训练过程中，我们会有一个理想情况下从这类数据训练的Reward Model，它为每个摘要（？）计算一个reward R

  4. 我们可以设计一个损失函数，使其基于奖励和人类标签计算。下面的损失函数是两个奖励差值的sigmoid函数的对数，可以用来更新Reward model
     $$
     \text{loss} = \log \big( \sigma ( r_j - r_k ) \big)
     $$
     其中：$\sigma(⋅)$表示sigmoid Function；$r_j,r_k$表示两个response的reward score

     - Dean理解：收集人类偏好数据，训练Reward Model，再用这个Reward Model去给policy model提供奖励，做PPO等Online RL

  5. 这类Reward model经常从现有的Instruct model（指令模型）初始化，然后它在非常大规模的人类或机器生成的Preference data（偏好数据）上进行训练

- Option 2：Verifiable Reward（基于正确性的领域）

  1. 一般用于基于正确性的领域：
     - 数学：检查response是否匹配正确答案
     - 编程：通过unit test（单元测试）来验证编码结果的正确性
  2. 一个可靠的Reward Function在这些领域甚至可以比reward model更精确
  3. 这种Verifiable reward也更常用于训练reasoning models，这些模型有望在编程和数学等问题上表现得非常好



![PPO vs GRPO](https://guoyangming-dean.github.io/assets/pictures/pic001_PPO_vs_GRPO.png)

PPO（Proximal Policy Optimization 近端策略优化）

1. 其被用于创建第一个版本的ChatGPT

2. 通常同一组queries queue（查询队列）开始，并将其扩展到Policy model（policy model本质上就是语言模型本身，你想要更新和训练的模型），模型将生成output和responses，这些回复将被提供给三个不同的模型：

   1. reference model：其是原始模型的副本，主要用来计算一些KL divergence，希望能使语言模型不会与原始权重相差太大
   2. reward model：接收query和output，并在这里输出奖励来指导模型的更新
   3. trainable value model或者critic model（评论模型）：这种critic model试图为每个单独的token分配credits（信用），这样就可以将那些response-level reward分解为token-level reward 。

3. 本质上，在我们获得reward和value model的输出后，我们将使用一种成为generalized advantage estimation（广义优势估计），来估计这里成为Advantage的概念，它是图标整每个单独token的credits（信用），或每个单独token对整个回复的贡献。

4. 通过查看individual advantage（单个优势），我们可以将其作为信号来指导policy model的更新

5. 所以本质上，PPO，试图最大化当前策略 $\pi_{\theta}$的回报（return）优势（advantage）。但由于无法从最新的模型$\pi_{\theta}$中采样，在这个PPO target function formula（目标函数公式）这里有一个重要的采样技巧：
   $$
   J_{\mathrm{PPO}}(\theta)
   =
   \mathbb{E}\!\left[q \sim P(Q),\; o \sim \pi_{\theta_{\mathrm{old}}}(O \mid q)\right]
   \frac{1}{|o|}
   \sum_{t=1}^{|o|}
   \min\!\left[
   \frac{\pi_{\theta}(o_t \mid q, o_{<t})}{\pi_{\theta_{\mathrm{old}}}(o_t \mid q, o_{<t})} A_t,\;
   \operatorname{clip}\!\left(
   \frac{\pi_{\theta}(o_t \mid q, o_{<t})}{\pi_{\theta_{\mathrm{old}}}(o_t \mid q, o_{<t})},
   1-\epsilon,\; 1+\epsilon
   \right) A_t
   \right]
   $$
   公式解读：

   1. 本质上，我们想要最大化一个expected advantage（期望优势），也就是 $A_t$，其中expectation（期望）是在 $\pi_{\theta}$ 上取得
   2. 但我们只从language model的前一步获取数据，也就是 $\pi_{\theta_{\mathrm{old}}}$，所以我们取由 $\pi_{\theta_{\mathrm{old}}}$生成的回复的expectation，然后我们设计一个important ratio（重要性比率），也就是 $\frac{\pi_{\theta}(o_t \mid q, o_{<t})}{\pi_{\theta_{\mathrm{old}}}(o_t \mid q, o_{<t})}$  。其中 $\pi_{\theta_{\mathrm{old}}}$ 是前一步的语言模型， $\pi_{\theta}$ 是当前步骤的语言模型。通过这种方式，你本质上是在尝试最大化当前策略 $\pi_{\theta}$ 的expected advantage（期望优势）
   3. 在这个PPO loss function中还有一些其他技巧，它试图clip this ratio（裁剪这个比率），使得这个ratio在训练过程中不会太大或者太小。它还取一个direct ratio（直接比率）乘以advantage（优势）和一个clip ratio（裁剪比率）乘以advantage（优势）的最小值。
   4. 因此，作为结果，这样的PPO利用了一种重要的sampling-based method（基于采样的方法），试图为给定的当前策略 $\pi_{\theta}$ 最大化advantage



GRPO（Group Relative Policy Optimization 分组相对策略优化）

1. 由DeepSeek提出，并用于大多数DeepSeek训练。实际上与PPO非常相似，因为它也使用advantage ，并且最大化完全相同的公式，来更新你的模型

2. 和PPO的主要区别在于计算Advantage function的方式

   1. 仍然从query queue（查询队列）开始，将其发送给policy model。policy model 生成多个responses，从即，从 $o_1$ 到  $o_G$ 为一组。
   2. 对于每个prompt，你会生成G个响应，仍然使用reference model和reward model来计算 KL divergence以及每个response的reward。
   3. 然后你得到同一query的一组结果，但又多个output和多个reward，然后你使用一些group compulation（组计算）为每个输出计算relative reward（相对奖励）。而且你假设该relative reward将作为每个单独token的advantage。
   4. 使用这种方式，你获得了每个token更加直接的advantage的优势估计，你使用该advantage来更新policy model。
   5. 本质上，获得advantage之后的所有步骤，PPO和GRPO非常相似。主要区别在estimating advantage（估计优势）的方式:
      1. PPO依赖额外的value model，该模型需要在整个过程中进行训练
      2. GRPO摒弃了value model，因为更加memory efficient（内存高效）。摒弃这种value model的代价是，你的advantage estimation可能更加直接粗暴，并且对同一response中的每个token保持相同。
      3. 而对于PPO，每个token的advantage可以是不同的。
      4. 简而言之：PPO使用额外的value model（或者credit model）为每个token分配credits（信用值）。通过这种方式，在整个生成过程中，每个word或者token将有不同的advantage value，这表明哪个token更加重要。而在GRPO中，因为摒弃了这种value model 或者 credit model，每个token将有相同的advantage，只要它们处于同一输出中
      5. 所以PPO，对于每个单独的token通常提供更细粒度的advantage feedback。而GRPO则对同一response中的token提供更加同一的advantage

3. 公式：
   $$
   \mathcal{J}_{\mathrm{GRPO}}(\theta)
   =
   \mathbb{E}\!\left[
   q \sim P(Q),\;
   \{o_i\}_{i=1}^{G} \sim \pi_{\theta_{\mathrm{old}}}(O \mid q)
   \right]
   \frac{1}{G}
   \sum_{i=1}^{G}
   \frac{1}{|o_i|}
   \sum_{t=1}^{|o_i|}
   \left\{
   \min\!\left[
   \frac{\pi_{\theta}(o_{i,t}\mid q, o_{i,<t})}{\pi_{\theta_{\mathrm{old}}}(o_{i,t}\mid q, o_{i,<t})}\hat{A}_{i,t},
   \;
   \operatorname{clip}\!\left(
   \frac{\pi_{\theta}(o_{i,t}\mid q, o_{i,<t})}{\pi_{\theta_{\mathrm{old}}}(o_{i,t}\mid q, o_{i,<t})},
   1-\epsilon,\; 1+\epsilon
   \right)\hat{A}_{i,t}
   \right]
   -\beta \mathbb{D}_{\mathrm{KL}}\!\left[\pi_{\theta}\|\pi_{\mathrm{ref}}\right]
   \right\}
   $$



GRPO vs PPO

1. GRPO：
   1. 更适binary，或者correctness-based reward（基于正确性的奖励）
   2. 需要更大量的样本，由于其只对full response，而非individual tokens分配credits的特性
   3. 需要更少GPU memory，因为不需要value model
2. PPO：
   1. 通常在reward model或binary reward上都表现良好
   2. 更加sample efficient
   3. 需要更多GPU



# 08.Online RL in Practice

GRPO

from trl import GRPOTrainer, GRPOConfig

# 09.Conclusion

Common methods in post-training：

1. SFT：
   1. Principles：通过最大化回复的概率来imitate example responses（模仿示例回复）。
   2. Pros：实现简单，非常适合快速启动新的model behavior（模型行为）
   3. Cons：但是对于那些未包含在训练数据中的任务，可能会降低其他性能
2. On RL（e.g. PPO，GRPO）：
   1. Principle：最大化回复的奖励函数
   2. Pros：善于提高模型能力，而不会降低在未见任务上的性能
   3. Cons：实现复杂，需要设计良好的reward functions才能真正高效
3. DPO：
   1. Principles：鼓励好答案，抑制不良的答案
   2. Pros：以Contrastive Learning（对比学习）方式训练模型，擅长修复错误行为和提高目标能力
   3. Cons：容易过拟合。实现复杂度介于SFT和Online RL之间



为什么Online RL相比SFT可能降低性能更少？

- Online RL：在模型自身的native manifold（原生流行）内，试图tweak（调整）模型行为
- SFT：SFT可能会将模型拖入一个陌生的世界（因为Example Response可能会和模型自身的所有回复极其不同），并冒险对模型权重进行不必要的改变





