---
title: "Projects"
description: "Software I contribute to and the research lines behind it."
---

<div class="project">

### QoolQit

<p class="project-role">Pasqal, 2026 to present. Contributor (development and roadmap).</p>

[QoolQit](https://pasqal-io.github.io/qoolqit/latest/) is Pasqal's open-source Python library for algorithm development in the Rydberg analog model. The idea is to let you write the algorithm once, in device-independent units, and leave compilation, unit conversion, device constraints and backend integration to the library.

Links: [GitHub](https://github.com/pasqal-io/qoolqit), [PyPI](https://pypi.org/project/qoolqit/), [documentation](https://pasqal-io.github.io/qoolqit/latest/)

</div>

<div class="project">

### Machine learning for quantum many-body physics

<p class="project-role">CPHT, École Polytechnique and Collège de France, 2024 to 2026.</p>

Neural-network quantum states treat a many-body wavefunction as a model to be trained, with variational Monte Carlo. During my postdoc I worked on the optimisation side of that problem: natural-gradient methods and cheaper approximations of the quantum geometric tensor (the quantum analogue of the Fisher information matrix), variance reduction of stochastic gradients by importance sampling, and foundation-style models trained once across a whole family of Hamiltonians instead of one at a time. The methods are implemented in [NetKet](https://github.com/netket/netket), the JAX framework for variational quantum simulation, and its extension [NetKet Foundation](https://github.com/netket/netket_foundation).

Related papers: importance sampling for VMC gradients ([MLST 7, 015035](https://doi.org/10.1088/2632-2153/ae387f)), block-structured approximations of the quantum geometric tensor ([DiffSys workshop, EurIPS 2025](https://openreview.net/forum?id=KOxyy2JGbR)), a hybrid classical-quantum algorithm for molecular spectra ([arXiv:2510.24911](https://arxiv.org/abs/2510.24911)).

</div>

<div class="project">

### Tensor networks meet the stabilizer formalism

<p class="project-role">2023 to 2025. With A. F. Mello, G. Lami, J. De Nardis, M. Collura.</p>

Clifford circuits are cheap to simulate but not universal; tensor networks are universal but choke on entanglement. We combined the two: a Clifford layer absorbs the "easy" part of the entanglement and a matrix product state or operator handles the rest. This gave the hybrid stabilizer MPO ([PRL 133, 150604](https://doi.org/10.1103/PhysRevLett.133.150604)) and the Clifford-dressed TDVP ([PRL 134, 150403](https://doi.org/10.1103/PhysRevLett.134.150403)), with an application to Loschmidt echoes ([PRA 111, 052401](https://doi.org/10.1103/PhysRevA.111.052401)).

</div>

<div class="project">

### Benchmarking early quantum hardware

<p class="project-role">2021 to 2023. With A. Solfanelli, M. Campisi, V. Vitale, S. Gherardini, G. Giachetti.</p>

A series of experiments on IBM superconducting devices using thermodynamic and foundational tests as benchmarks: fluctuation relations ([PRX Quantum 2, 030353](https://doi.org/10.1103/PRXQuantum.2.030353)), Leggett-Garg inequality violations ([PRA 105, 032610](https://doi.org/10.1103/PhysRevA.105.032610)), qubit resetting by thermodynamic protocols ([AVS Quantum Sci. 4, 026802](https://doi.org/10.1116/5.0091121)) and measurement-induced thermalisation ([J. Phys. Commun. 7, 065007](https://doi.org/10.1088/2399-6528/acdd4f)).

</div>

<div class="project">

### Tensor Network Techniques for Quantum Computation (book)

<p class="project-role">SISSA Medialab, 2024. With M. Collura, G. Lami, N. Ranabhat. Open access.</p>

A 200-page introduction to tensor networks for quantum computation and quantum information, aimed at advanced undergraduate and graduate students. Part I covers the foundations (MPS, contractions), Part II the applications.

Links: [arXiv:2503.04423](https://arxiv.org/abs/2503.04423), [publisher (DOI)](https://doi.org/10.22323/9788898587049)

</div>
