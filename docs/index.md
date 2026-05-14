---
layout: single
author_profile: true
title: ""
---

<style>
.home-hero {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.home-kicker {
  margin: 0 0 0.35rem;
  color: #596579;
  font-size: 0.78em;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.home-title {
  margin: 0 0 0.65rem;
  font-size: 2em;
  line-height: 1.15;
}

.home-summary {
  max-width: 760px;
  margin: 0;
  color: #4b5563;
  font-size: 1.05em;
  line-height: 1.65;
}

.home-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.1rem;
}

.home-section {
  margin-top: 2.25rem;
}

.home-section-title {
  margin-bottom: 1rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid #e5e7eb;
}

.home-focus-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
}

.home-focus-item {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}

.home-focus-item h3 {
  margin: 0 0 0.45rem;
  font-size: 1em;
}

.home-focus-item p {
  margin: 0;
  color: #4b5563;
  font-size: 0.92em;
  line-height: 1.55;
}

.home-list {
  margin-bottom: 0;
  padding-left: 1.25rem;
}

.home-list li + li {
  margin-top: 0.85rem;
}

.home-note {
  color: #4b5563;
  font-size: 0.95em;
}

@media (max-width: 768px) {
  .home-title {
    font-size: 1.6em;
  }

  .home-focus-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<section class="home-hero">
  <p class="home-kicker">Senior Algorithm Engineer</p>
  <h1 class="home-title">Yangming Guo</h1>
  <p class="home-summary">
    I work on LLM agents, retrieval systems, medical AI, and robotics. My work connects
    applied machine learning with production systems and biomedical research.
  </p>
  <div class="home-actions">
    <a href="/assets/cv/CV_Yangming_Guo.pdf" class="btn btn--primary">Download CV</a>
    <a href="/about/" class="btn btn--inverse">About</a>
  </div>
</section>

<section class="home-section">
  <h2 class="home-section-title">Focus</h2>
  <div class="home-focus-grid">
    <div class="home-focus-item">
      <h3>LLM Systems</h3>
      <p>Academic writing agents, RAG systems, domain knowledge platforms, and practical agent workflows.</p>
    </div>
    <div class="home-focus-item">
      <h3>Medical AI</h3>
      <p>ECG analysis, traditional Chinese medicine AI platforms, and drug perturbation prediction.</p>
    </div>
    <div class="home-focus-item">
      <h3>Robotics</h3>
      <p>Cloud-based teleoperation, interventional surgical robots, and intelligent control systems.</p>
    </div>
  </div>
</section>

<section class="home-section">
  <h2 class="home-section-title">Selected Publications</h2>
  <ol class="home-list">
    <li><strong>Bao, X., Guo, S., Guo, Y., Yang, C., Shi, L., Li, Y., & Jiang, Y.</strong> (2022). Multilevel operation strategy of a vascular interventional robot system for surgical safety in teleoperation. <em>IEEE Transactions on Robotics, 38</em>(4).</li>
    <li><strong>Xu, Z., Guo, Y., Zhao, T., Zhao, Y., Liu, Z., Sun, X., Xie, G., & Li, Y.</strong> (2022). Abnormality classification from electrocardiograms with various lead combinations. <em>Physiological Measurement, 43</em>(7).</li>
    <li><strong>Zhu, Z., Lan, X., Zhao, T., Guo, Y., Kojodjojo, P., Xu, Z., Liu, Z., Liu, S., Wang, H., Sun, X., & Feng, M.</strong> (2021). Identification of 27 abnormalities from multi-lead ECG signals: An ensembled SE_ResNet framework with Sign Loss function. <em>Physiological Measurement, 42</em>(6).</li>
  </ol>
</section>

<section class="home-section">
  <h2 class="home-section-title">Conference Papers</h2>
  <ol class="home-list">
    <li><strong>Guo, Y., Guo, S., & Yang, C.</strong> (2020, August). Feasibility study on cloud communication operation for an interventional surgery robot. In <em>Proceedings of the 2020 IEEE International Conference on Mechatronics and Automation (ICMA)</em> (pp. 443-447). Beijing, China. [Oral presentation and paper publication]</li>
    <li><strong>Guo, S., Guo, Y., Bao, X., & Yang, C.</strong> (2019, August). A PID-type fuzzy logic controller for an interventional surgical robot. In <em>Proceedings of the 2019 IEEE International Conference on Mechatronics and Automation (ICMA)</em> (pp. 2529-2533). Tianjin, China. [Oral presentation and paper publication]</li>
  </ol>
</section>

<section class="home-section">
  <h2 class="home-section-title">Patents</h2>
  <ol class="home-list">
    <li><strong>Guo, Y., Hao, B., & Tang, R.</strong> (2023). Prediction method, device, apparatus, and medium for gene expression in cells after drug perturbation (CN116959569A). China National Intellectual Property Administration.</li>
    <li><strong>Guo, Y., & Xu, Z.</strong> (2022). ECG classification method based on deep learning, device, apparatus, and storage medium (CN114587378A). China National Intellectual Property Administration.</li>
    <li><strong>Guo, S., Yang, C., Guo, Y., & Bao, X.</strong> (2020). Master controller of an interventional surgical robot (CN212089720U). China National Intellectual Property Administration.</li>
    <li><strong>Guo, S., Yang, C., Guo, Y., & Bao, X.</strong> (2020). Master operating device of an interventional surgical robot (CN212089719U). China National Intellectual Property Administration.</li>
  </ol>
  <p class="home-note">For a complete list of publications and patents, please see my <a href="/assets/cv/CV_Yangming_Guo.pdf">CV</a>.</p>
</section>

{% include gallery.html %}
