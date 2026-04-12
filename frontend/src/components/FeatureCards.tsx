import React from "react";
import styled from "styled-components";

import expImg from "@/assets/2.jpg";
import mlImg from "@/assets/4.webp";
import dlImg from "@/assets/3.jfif";

export default function FeatureCards() {
  return (
    <Wrapper>
      <div className="card">
        <div className="panel">
          <img src={expImg} alt="实验" />
          <div className="overlay">
            <h3>实验</h3>
            <p>基于真实实验数据进行分子结构验证与分析。</p>
          </div>
        </div>

        <div className="panel">
          <img src={mlImg} alt="机器学习" />
          <div className="overlay">
            <h3>机器学习</h3>
            <p>利用传统机器学习算法进行性质预测与建模。</p>
          </div>
        </div>

        <div className="panel">
          <img src={dlImg} alt="深度学习" />
          <div className="overlay">
            <h3>深度学习</h3>
            <p>使用神经网络进行分子表示学习与高维特征提取。</p>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 40px;

  .card {
    width: 900px;
    height: 260px;
    display: flex;
    gap: 10px;
  }

  .panel {
    flex: 1;
    position: relative;
    overflow: hidden;
    border-radius: 12px;
    transition: all 0.5s ease;
    cursor: pointer;
  }

  .panel:hover {
    flex: 3;
  }

  .panel img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .panel:hover img {
    transform: scale(1.1);
  }

  .overlay {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 20px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
    color: white;
    transform: translateY(60%);
    transition: all 0.5s ease;
  }

  .panel:hover .overlay {
    transform: translateY(0);
  }

  h3 {
    margin: 0 0 8px;
  }

  p {
    font-size: 14px;
    line-height: 1.5;
  }
`;